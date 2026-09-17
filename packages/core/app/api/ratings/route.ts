import { getConfig, storeForLocale } from "../../../lib/magento.js";
import { RATINGS_QUERY } from "../../../graphql/catalog.js";
export const revalidate = 0;
// Per-store rating IDs + option value_ids differ. Always resolve live, never hardcode. Top 10 only.
export async function GET(req: Request) {
  try {
    const c = getConfig();
    const url = new URL(req.url);
    const locale = url.searchParams.get("locale") ?? undefined;
    const store = url.searchParams.get("store") ?? storeForLocale(locale).store;
    const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store },
      body: JSON.stringify({ query: RATINGS_QUERY }),
      next: { tags: [`ratings:${store}`], revalidate: 3600 },
    });
    if (!res.ok) return Response.json({ ok: false, error: `MAGENTO_${res.status}` }, { status: 502 });
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "NON_JSON" }, { status: 502 });
    if (json.errors?.length) return Response.json({ ok: false, errors: json.errors }, { status: 400 });
    const items = (json.data.productReviewRatingsMetadata.items ?? []).slice(0, 10);
    return Response.json({ ok: true, store, items });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 500 });
  }
}
