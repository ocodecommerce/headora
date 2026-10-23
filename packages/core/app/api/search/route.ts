import { magentoFetch } from "../../../lib/magento.js";
import { QUICK_SEARCH_QUERY } from "../../../graphql/catalog.js";

export const revalidate = 0;

// GET /api/search?q=scarf&locale=en -> header quick-search suggestions (products + matching categories).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const locale = url.searchParams.get("locale") ?? undefined;
  if (q.length < 2) return Response.json({ products: [], categories: [] });
  try {
    const data = await magentoFetch<any>(QUICK_SEARCH_QUERY, { q }, { revalidate: 60, locale, tags: ["search"] });
    return Response.json({
      products: (data?.products?.items ?? []).map((p: any) => ({
        uid: p.uid, name: p.name, url_key: p.url_key,
        // Same as the legacy storefront: original image, not the install-specific resize cache.
        image: p.image?.url?.replace(/\/cache\/.*?\//, "/") ?? null,
      })),
      categories: (data?.categoryList ?? []).slice(0, 3).map((c: any) => ({ uid: c.uid, name: c.name, url_path: c.url_path })),
    });
  } catch {
    return Response.json({ products: [], categories: [] }, { status: 502 });
  }
}
