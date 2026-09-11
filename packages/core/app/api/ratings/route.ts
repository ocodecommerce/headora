import { getConfig } from "../../../lib/magento.js";
import { RATINGS_QUERY } from "../../../graphql/catalog.js";
// Per-store rating IDs differ. Always resolve live, never hardcode.
export async function GET(req: Request) {
  const c = getConfig();
  const store = new URL(req.url).searchParams.get("store") ?? c.NEXT_PUBLIC_STORE;
  const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: store },
    body: JSON.stringify({ query: RATINGS_QUERY }),
    next: { tags: [`ratings:${store}`], revalidate: 3600 },
  });
  const json = await res.json();
  if (json.errors?.length) return Response.json({ ok: false, errors: json.errors }, { status: 400 });
  return Response.json({ ok: true, store, items: json.data.productReviewRatingsMetadata.items });
}
