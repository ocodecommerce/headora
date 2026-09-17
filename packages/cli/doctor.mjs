import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

// 0. Standalone-safe env: load sites/demo-fashion/.env when vars aren't exported.
// Root-anchored so `npm run doctor` works from repo root or sites/demo-fashion.
function loadEnvFile() {
  if (process.env.MAGENTO_GRAPHQL_URL) return;
  for (const f of [join(root, "sites/demo-fashion/.env"), join(root, ".env")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
    console.log(`Loaded env from ${f}`);
    return;
  }
}
loadEnvFile();

// 1. Theme preset must be a known variant (theme switch is config-only, never code).
const preset = (process.env.HEADORA_PRESET ?? "minimal").trim().toLowerCase();
if (!["minimal", "bold", "classic"].includes(preset)) {
  console.error(`HEADORA_PRESET invalid: "${preset}" (expected minimal|bold|classic)`);
  process.exit(1);
}

// 2. Core/preset version contract: site pins @headora/core, preset JSONs must stay in sync.
try {
  const corePkg = JSON.parse(readFileSync(join(root, "packages/core/package.json"), "utf8"));
  const sitePkg = JSON.parse(readFileSync(join(root, "sites/demo-fashion/package.json"), "utf8"));
  const coreVer = corePkg.version;
  const pinned = sitePkg.dependencies?.["@headora/core"];
  if (pinned !== coreVer && pinned !== `^${coreVer}` && pinned !== `~${coreVer}`) {
    console.error(`Version drift: site pins @headora/core=${pinned} but core is ${coreVer}. Align before deploy.`);
    process.exit(1);
  }
  console.log(`Versions OK: core=${coreVer} preset=${preset}`);
} catch (e) {
  console.error("Version check failed:", e.message);
  process.exit(1);
}

// 3. Preset JSONs must parse (a broken theme must fail the gate, not the live site).
for (const f of [join(root, "packages/preset-base/tokens.json"), join(root, "packages/preset-base/blocks.json"), join(root, `packages/preset-${preset}/preset.json`)]) {
  if (!existsSync(f)) { console.error(`Missing ${f}`); process.exit(1); }
  try { JSON.parse(readFileSync(f, "utf8")); } catch { console.error(`Invalid JSON: ${f}`); process.exit(1); }
}
console.log("Theme JSON OK");

// 4. Magento reachability (warning-only for degraded mode; health route reports it at runtime).
const url = process.env.MAGENTO_GRAPHQL_URL;
if (!url) { console.error("MAGENTO_GRAPHQL_URL missing (export it or add sites/demo-fashion/.env)"); process.exit(1); }
const q = { query: "{ storeConfig { store_name base_currency_code } }" };
try {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Store: process.env.NEXT_PUBLIC_STORE ?? "default" }, body: JSON.stringify(q) });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  console.log("Magento OK:", JSON.stringify(j.data));
} catch (e) { console.error("Magento unreachable:", e.message); process.exit(1); }
