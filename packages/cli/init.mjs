#!/usr/bin/env node
// create-headora-app: scaffolds a Headora storefront in a new folder (like `npx @magento/pwa` for Venia).
//   npx create-headora-app my-store [--url=https://shop.example/graphql] [--store=default]
//     [--currency=USD] [--preset=minimal|bold|classic] [--site-name="My Shop"] [--yes] [--no-install]
// Run from a Headora checkout (or with --local=/path/to/repo) to install the repo's packages
// as npm-pack tarballs instead of from the npm registry.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const here = dirname(fileURLToPath(import.meta.url));
const version = JSON.parse(readFileSync(join(here, "package.json"), "utf8")).version;
const PRESETS = ["minimal", "bold", "classic"];
const PACKAGES = ["core", "preset-base", "preset-bold", "preset-classic", "preset-minimal"];
// Files the template must never carry into a new project.
const SKIP = new Set(["node_modules", ".next", ".env", "tsconfig.tsbuildinfo", "next-env.d.ts"]);

const flags = {};
const positional = [];
for (const a of process.argv.slice(2)) {
  if (!a.startsWith("--")) { positional.push(a); continue; }
  const [k, ...v] = a.slice(2).split("=");
  flags[k] = v.length ? v.join("=") : true;
}
const fail = (msg) => { console.error(`✖ ${msg}`); process.exit(1); };

// Published package: bundled template/ (copied at prepack). Repo checkout: the demo site itself.
const repo = typeof flags.local === "string" ? resolve(flags.local) : resolve(here, "..", "..");
const bundled = join(here, "template");
const template = existsSync(bundled) && !flags.local ? bundled : join(repo, "sites", "demo-fashion");
const local = template !== bundled;
// npm 9 npx copies a local package into its cache, so the repo can't be found from there.
if (!existsSync(join(template, "package.json"))) {
  fail(`template not found at ${template}\n  Run the CLI with node instead of npx: node <headora-repo>/packages/cli/init.mjs my-store\n  or pass the repo: --local=<headora-repo>`);
}

const rl = process.stdin.isTTY && !flags.yes ? createInterface({ input: process.stdin, output: process.stdout }) : null;
const ask = async (question, fallback) => {
  if (!rl) return fallback;
  return (await rl.question(`${question} (${fallback}): `)).trim() || fallback;
};
const str = (v) => (typeof v === "string" ? v : undefined);

// Ask until valid (flags and non-interactive runs fail instead). check() returns an error message or "".
const askValid = async (flag, question, fallback, check) => {
  for (;;) {
    const value = str(flags[flag]) ?? (await ask(question, fallback));
    const error = check(value);
    if (!error) return value;
    if (!rl || str(flags[flag])) fail(error);
    console.log(`  ${error}`);
  }
};

const dir = resolve(positional[0] ?? (await ask("Project folder", "my-headora-store")));
if (existsSync(dir) && readdirSync(dir).length) fail(`${dir} already exists and is not empty`);
// A base URL is accepted too: https://shop.example.com -> https://shop.example.com/graphql
const toGraphqlUrl = (v) => v.replace(/\/+$/, "").replace(/^(https?:\/\/[^/]+)$/i, "$1/graphql");
const graphqlUrl = toGraphqlUrl(await askValid("url", "Magento GraphQL URL", "https://magento.test/graphql", (v) =>
  /^https?:\/\/[^/\s]+/i.test(v) ? "" : `not an http(s) URL: ${v}`));
// Store view code, e.g. "default" (Stores > All Stores). Not a URL: it is sent as Magento's Store header.
const store = await askValid("store", "Magento store view code", "default", (v) =>
  /^[a-z0-9_]+$/i.test(v) ? "" : `"${v}" is not a store view code. Use the code from Magento Stores > All Stores, e.g. default`);
const currency = (str(flags.currency) ?? (await ask("Currency", "USD"))).toUpperCase();
const preset = (str(flags.preset) ?? (await ask(`Preset (${PRESETS.join("/")})`, "minimal"))).toLowerCase();
if (!PRESETS.includes(preset)) fail(`preset must be one of: ${PRESETS.join(", ")}`);
const siteName = str(flags["site-name"]) ?? (await ask("Store name", "Headora"));
rl?.close();

// Check Magento before writing anything: a wrong store code makes every page render empty.
try {
  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: store },
    body: JSON.stringify({ query: "{ storeConfig { store_name } }" }),
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json().catch(() => null);
  const name = json?.data?.storeConfig?.store_name;
  if (name) console.log(`✔ Magento answered: store "${name}"`);
  else if (json?.errors?.length) fail(`Magento rejected store "${store}": ${json.errors[0].message}`);
  else console.log(`! ${graphqlUrl} did not answer like Magento GraphQL (HTTP ${res.status}). Check MAGENTO_GRAPHQL_URL in .env.`);
} catch (e) {
  console.log(`! Could not reach ${graphqlUrl} (${e.cause?.code ?? e.name}). Fix MAGENTO_GRAPHQL_URL in .env later.`);
}

// 1. Copy the storefront template.
cpSync(template, dir, { recursive: true, filter: (src) => !SKIP.has(basename(src)) });

// 2. .env from the template's documented .env.example, with this store's answers.
const values = {
  MAGENTO_GRAPHQL_URL: graphqlUrl,
  MAGENTO_BASE_URL: graphqlUrl.replace(/\/graphql$/, ""),
  NEXT_PUBLIC_STORE: store,
  NEXT_PUBLIC_CURRENCY: currency,
  NEXT_PUBLIC_STORES: store,
  NEXT_PUBLIC_LOCALES: "en",
  NEXT_PUBLIC_CURRENCIES: currency,
  REVALIDATE_SECRET: randomBytes(16).toString("hex"),
  HEADORA_PRESET: preset,
  HEADORA_SITE_NAME: siteName,
  HEADORA_COPYRIGHT: `Copyright © ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
  HEADORA_SOCIAL_LINKS: "",
};
const example = readFileSync(join(dir, ".env.example"), "utf8");
writeFileSync(join(dir, ".env"), example.replace(/^([A-Z0-9_]+)=.*$/gm, (line, key) => (key in values ? `${key}=${values[key]}` : line)));
const configFile = join(dir, "headora.config.ts");
if (existsSync(configFile)) writeFileSync(configFile, readFileSync(configFile, "utf8").replace(/preset: "[a-z]+"/, `preset: "${preset}"`));
writeFileSync(join(dir, ".gitignore"), "node_modules\n.next\n.env\n*.tsbuildinfo\nnext-env.d.ts\n");

// 3. package.json: own name, standalone scripts, @headora/core from npm (or local tarballs).
const pkgFile = join(dir, "package.json");
const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
pkg.name = basename(dir).toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
pkg.version = "0.1.0";
pkg.scripts = { dev: "next dev", build: "next build", start: "next start" };
pkg.dependencies["@headora/core"] = `^${version}`;
if (local) {
  const out = join(dir, ".headora-packages");
  mkdirSync(out);
  const tarball = {};
  for (const p of PACKAGES) {
    const [info] = JSON.parse(execSync(`npm pack --json --pack-destination "${out}"`, { cwd: join(repo, "packages", p), encoding: "utf8" }));
    tarball[info.name] = `file:.headora-packages/${info.filename}`;
  }
  pkg.dependencies["@headora/core"] = tarball["@headora/core"];
  // core depends on the presets by version; point those at the tarballs too.
  pkg.overrides = { ...pkg.overrides, ...Object.fromEntries(Object.entries(tarball).filter(([n]) => n !== "@headora/core")) };
}
writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✔ Created ${dir} (preset ${preset}${local ? ", local @headora packages" : ""})`);

// 5. Install.
if (!flags["no-install"]) execSync("npm install", { cwd: dir, stdio: "inherit" });

console.log(`
Next steps:
  cd ${positional[0] ?? dir}
  ${flags["no-install"] ? "npm install\n  " : ""}npm run dev
Magento side: install the Ocode_Headora module (packages/magento-connector) on the Magento store.`);
