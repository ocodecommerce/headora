export const revalidate = 0;
export const dynamic = "force-dynamic";
// Liveness for nginx / pm2 / docker healthchecks. Never fails on Magento down —
// reports degraded instead so deploys don't flap when Magento is slow.
export async function GET() {
  const started = Date.now();
  let magento: "ok" | "degraded" | "unconfigured" = "unconfigured";
  const url = process.env.MAGENTO_GRAPHQL_URL;
  if (url) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Store: process.env.NEXT_PUBLIC_STORE ?? "default" },
        body: JSON.stringify({ query: "{ storeConfig { store_name } }" }),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(t));
      magento = r.ok ? "ok" : "degraded";
    } catch {
      magento = "degraded";
    }
  }
  return Response.json({
    ok: true,
    preset: process.env.HEADORA_PRESET ?? "minimal",
    magento,
    uptimeMs: Date.now() - started,
    time: new Date().toISOString(),
  });
}
