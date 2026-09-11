import { magentoFetch, URL_RESOLVE_QUERY } from "../../../lib/magento.js";
import { PDP_QUERY, REVIEWS_QUERY, CATEGORY_QUERY, CMS_QUERY } from "../../../graphql/catalog.js";
import { PdpTabs } from "../../../components/product/PdpTabs.js";
export const revalidate = 120;
export async function generateMetadata({ params }: { params: Promise<{ locale: string; url: string[] }> }) {
  const { url } = await params;
  return { title: url?.join(" / ") ?? "Store", alternates: { canonical: `/${url?.join("/") ?? ""}` } };
}
export default async function CatchAll({ params }: { params: Promise<{ locale: string; url: string[] }> }) {
  const { locale, url } = await params;
  const path = `/${url?.join("/") ?? ""}`;
  const resolved = await magentoFetch<{ urlResolver: { type: string; id?: number } | null }>(
    URL_RESOLVE_QUERY, { url: path }, { tags: [`url:${path}`, `locale:${locale}`], revalidate: 120, locale }
  ).catch(() => ({ urlResolver: null }));
  if (!resolved.urlResolver) return <main><h1>Not found</h1><p>{path}</p></main>;
  const kind = resolved.urlResolver.type;
  if (kind === "PRODUCT") {
    const slug = url?.[url.length - 1]?.replace(/\.html$/, "") ?? "";
    const pdp = await magentoFetch<any>(PDP_QUERY, { urlKey: slug }, { tags: [`pdp:${slug}`, `locale:${locale}`], revalidate: 120, locale }).catch(() => null);
    const item = pdp?.products?.items?.[0];
    if (!item) return <main><h1>{slug}</h1><p>Product data pending. Check PDP_QUERY mapping.</p></main>;
    const rev = await magentoFetch<any>(REVIEWS_QUERY, { sku: item.sku }, { tags: [`reviews:${item.sku}`, `locale:${locale}`], revalidate: 60, locale }).catch(() => null);
    const node = rev?.products?.items?.[0] ?? { reviews: { items: [] }, review_count: 0, rating_summary: 0 };
    return (
      <main style={{ padding: 24, display: "grid", gap: 24 }}>
        <div><h1>{item.name}</h1><p>{item.sku} - {item.price_range?.minimum_price?.final_price?.value}</p></div>
        <PdpTabs
          description={item.description?.html ?? ""}
          details={item.short_description?.html ?? ""}
          reviews={node.reviews?.items ?? []}
          reviewCount={node.review_count ?? 0}
          ratingSummary={node.rating_summary ?? 0}
          sku={item.sku}
          locale={locale}
          loginUrl="/customer/account/login"
        />
      </main>
    );
  }
  if (kind === "CATEGORY") {
    const data = await magentoFetch<any>(CATEGORY_QUERY, { id: path.replace(/^\//, "") }, { tags: [`cat:${path}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
    return <main style={{ padding: 24 }}><h1>{data?.categories?.items?.[0]?.name ?? kind}</h1><p>{path}</p></main>;
  }
  const cmsId = url?.[url.length - 1]?.replace(/\.html$/, "") ?? "home";
  const cms = await magentoFetch<any>(CMS_QUERY, { id: cmsId }, { tags: [`cms:${cmsId}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
  if (cms?.cmsPage) return <main style={{ padding: 24 }}><h1>{cms.cmsPage.title}</h1><div dangerouslySetInnerHTML={{ __html: cms.cmsPage.content }} /></main>;
  return <main style={{ padding: 24 }}><h1>{kind}</h1><p>{path}</p></main>;
}
