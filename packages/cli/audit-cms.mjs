import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const strict = process.argv.includes("--strict");

// Bare-headora content contract (see README-2.0.md).
// Magento defaults (CreateDefaultPages.php) + headora-owned slots. Everything else is custom.
const DEFAULT_PAGES = ["home", "no-route", "enable-cookies", "privacy-policy-cookie-restriction-mode"];
const KNOWN_CUSTOM_PAGES = [
  "sell-old-used-jewelry-watches-online", "our-story", "press", "glossary", "ios-app",
  "consignment-page", "how-to-check-size-and-fit", "watch-warranty", "authenticity-promise",
  "shipping-1", "terms-of-service", "returns", "privacy-policy", "boutique-not-found", "bitpay-terms",
];
const KNOWN_CUSTOM_CATEGORIES = [
  "venia-accessories/venia-jewelry", "venia-tops", "venia-bottoms", "venia-dresses",
  "venia-accessories", "shop-the-look", "new-products3",
];
const HEADORA_BLOCK_PREFIX = "headora_hero_";

function loadEnvFile() {
  if (process.env.MAGENTO_GRAPHQL_URL) return;
  for (const f of [join(root, "sites/demo-fashion/.env"), join(root, ".env")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
    console.log(`Loaded env from ${f}`);
    return;
  }
}
loadEnvFile();

const URL = process.env.MAGENTO_GRAPHQL_URL;
const STORE = process.env.NEXT_PUBLIC_STORE ?? "default";
const LOCALES = (process.env.NEXT_PUBLIC_LOCALES ?? process.env.NEXT_PUBLIC_LOCALE ?? "en").split(",").map((s) => s.trim()).filter(Boolean);
if (!URL) { console.error("MAGENTO_GRAPHQL_URL missing (export it or add sites/demo-fashion/.env)"); process.exit(2); }

async function gql(query, variables) {
  const r = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: STORE },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

const PAGE_Q = `query($id:String!){ cmsPage(identifier:$id){ title identifier } }`;
const BLOCKS_Q = `query($ids:[String]!){ cmsBlocks(identifiers:$ids){ items{ identifier } } }`;
const CAT_Q = `query($url:String!){ categories(filters:{ category_url_path:{ eq:$url } }){ items{ name url_path } } }`;

let junk = [];
console.log("identifier | status | action");
for (const id of [...DEFAULT_PAGES, ...KNOWN_CUSTOM_PAGES]) {
  let status = "missing";
  try {
    const j = await gql(PAGE_Q, { id });
    if (j.data?.cmsPage) status = `live (${j.data.cmsPage.title})`;
  } catch (e) { status = `error (${e.message})`; }
  const keep = DEFAULT_PAGES.includes(id);
  const action = keep ? (status.startsWith("live") ? "KEEP ok" : "KEEP missing!") : (status.startsWith("live") ? "DELETE" : "gone ok");
  if (!keep && status.startsWith("live")) junk.push(`page:${id}`);
  console.log(`${id} | ${status} | ${action}`);
}
for (const url of KNOWN_CUSTOM_CATEGORIES) {
  let status = "missing";
  try {
    const j = await gql(CAT_Q, { url });
    if (j.data?.categories?.items?.length) status = `live (${j.data.categories.items[0].name})`;
  } catch (e) { status = `error (${e.message})`; }
  const action = status.startsWith("live") ? "DELETE" : "gone ok";
  if (status.startsWith("live")) junk.push(`category:${url}`);
  console.log(`${url} | ${status} | ${action}`);
}
try {
  const ids = LOCALES.map((l) => `${HEADORA_BLOCK_PREFIX}${l}`);
  const j = await gql(BLOCKS_Q, { ids });
  const found = (j.data?.cmsBlocks?.items ?? []).map((b) => b.identifier);
  for (const id of ids) console.log(`${id} | ${found.includes(id) ? "live (headora slot)" : "missing (author neutral content)"} | KEEP slot`);
} catch (e) { console.log(`headora blocks | error (${e.message}) | check manually`); }

if (junk.length) {
  console.log(`\nNON-BARE CONTENT LIVE (${junk.length}):\n- ${junk.join("\n- ")}`);
  if (strict) { console.error("Strict mode: failing."); process.exit(1); }
} else console.log("\nBare-theme clean: no known custom content live.");
