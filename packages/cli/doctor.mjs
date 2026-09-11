const url = process.env.MAGENTO_GRAPHQL_URL;
if (!url) { console.error("MAGENTO_GRAPHQL_URL missing"); process.exit(1); }
const q = { query: "{ storeConfig { store_name base_currency_code } }" };
try {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Store: process.env.NEXT_PUBLIC_STORE ?? "default" }, body: JSON.stringify(q) });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  console.log("Magento OK:", JSON.stringify(j.data));
} catch (e) { console.error("Magento unreachable:", e.message); process.exit(1); }
