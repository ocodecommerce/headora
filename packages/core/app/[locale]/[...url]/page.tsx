import { getConfig, magentoFetch, URL_RESOLVE_QUERY } from "../../../lib/magento.js";
import { ProductView } from "../../../components/product/ProductView.js";
import { PDP_QUERY, REVIEWS_QUERY, CATEGORY_QUERY, CMS_QUERY, PLP_QUERY } from "../../../graphql/catalog.js";
import { Filters } from "../../../components/catalog/Filters.js";
import { SortSelect } from "../../../components/catalog/SortSelect.js";
import { Pagination } from "../../../components/catalog/Pagination.js";
import { money } from "../../../components/catalog/ProductCard.js";
import { SORTS, pageNumber, plpHref, selectedFilters, sortKey, toGraphqlFilter, visibleFacets, type Facet, type Search, type SortKey } from "../../../lib/plp.js";
import { getPresetName } from "../../../lib/theme.js";
import { PdpTabs } from "../../../components/product/PdpTabs.js";
import { ProductGrid } from "../../../components/catalog/ProductGrid.js";
import { Breadcrumbs, type Crumb } from "../../../components/layout/Breadcrumbs.js";
import { preparePageBuilder } from "../../../lib/pagebuilder.js";
export const revalidate = 120;
export async function generateMetadata({ params }: { params: Promise<{ locale: string; url: string[] }> }) {
  const { url } = await params;
  return { title: url?.join(" / ") ?? "Store", alternates: { canonical: `/${url?.join("/") ?? ""}` } };
}
function Message({ title, text }: { title: string; text: string }) {
  return <div className="hd-container hd-empty"><h1>{title}</h1><p>{text}</p></div>;
}
const PAGE_SIZE = 12;
export default async function CatchAll({ params, searchParams }: { params: Promise<{ locale: string; url: string[] }>; searchParams: Promise<Search> }) {
  const { locale, url } = await params;
  const path = `/${url?.join("/") ?? ""}`;
  const preset = getPresetName();
  const home: Crumb = { label: "Home", href: `/${locale}` };
  const resolve = (u: string) => magentoFetch<{ urlResolver: { type: string; id?: number } | null }>(
    URL_RESOLVE_QUERY, { url: u }, { tags: [`url:${u}`, `locale:${locale}`], revalidate: 120, locale }
  ).catch(() => ({ urlResolver: null }));
  let resolved = await resolve(path);
  // CMS content often links categories/products without the ".html" suffix Magento stores.
  if (!resolved.urlResolver && !/\.[a-z0-9]+$/i.test(path)) resolved = await resolve(`${path}.html`);
  if (!resolved.urlResolver) return <Message title="Page not found" text={path} />;
  const kind = resolved.urlResolver.type;
  if (kind === "PRODUCT") {
    const slug = url?.[url.length - 1]?.replace(/\.html$/, "") ?? "";
    const pdp = await magentoFetch<any>(PDP_QUERY, { urlKey: slug }, { tags: [`pdp:${slug}`, `locale:${locale}`], revalidate: 120, locale }).catch(() => null);
    // url_key filter also returns parents (bundle/grouped/configurable) containing the product: match exactly.
    const items: any[] = pdp?.products?.items ?? [];
    const item = items.find((i) => i?.url_key === slug) ?? items[0];
    if (!item) return <Message title={slug} text="Product data pending. Check PDP_QUERY mapping." />;
    const rev = await magentoFetch<any>(REVIEWS_QUERY, { sku: item.sku }, { tags: [`reviews:${item.sku}`, `locale:${locale}`], revalidate: 60, locale }).catch(() => null);
    const node = rev?.products?.items?.[0] ?? { reviews: { items: [] }, review_count: 0, rating_summary: 0 };
    // Deepest assigned category gives the breadcrumb trail.
    const cat = [...(item.categories ?? [])].sort((a: any, b: any) => (b.level ?? 0) - (a.level ?? 0))[0];
    const crumbs: Crumb[] = [home, ...(cat ? [{ label: cat.name, href: `/${locale}/${cat.url_path}.html` }] : []), { label: item.name }];
    const reviewCount = node.review_count ?? 0;
    return (
      <div className="hd-container hd-container--pdp">
        <Breadcrumbs items={crumbs} />
        <ProductView item={{ ...item, short_description: null }} reviewCount={reviewCount} locale={locale} magentoBaseUrl={getConfig().MAGENTO_BASE_URL} />
        <PdpTabs
          description={item.description?.html ?? ""}
          details={item.short_description?.html ?? ""}
          reviews={node.reviews?.items ?? []}
          reviewCount={reviewCount}
          ratingSummary={node.rating_summary ?? 0}
          sku={item.sku}
          locale={locale}
          loginUrl="/customer/account/login"
        />
      </div>
    );
  }
  if (kind === "CATEGORY") {
    const data = await magentoFetch<any>(CATEGORY_QUERY, { id: path.replace(/^\//, "").replace(/\.html$/, "") }, { tags: [`cat:${path}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
    const cat = data?.categories?.items?.[0];
    const crumbs: Crumb[] = [
      home,
      ...(cat?.breadcrumbs ?? []).map((b: any) => ({ label: b.category_name, href: `/${locale}/${b.category_url_path}.html` })),
      { label: cat?.name ?? "" },
    ];
    if (!cat?.uid) return <Message title="Category unavailable" text={path} />;

    // Layered navigation state lives in the URL; facets come from the unfiltered category.
    const search = await searchParams;
    const base = { category_uid: { eq: cat.uid } };
    const sort = sortKey(search);
    const page = pageNumber(search);
    const tags = [`cat:${path}`, `locale:${locale}`];
    const facetsOnly = await magentoFetch<any>(PLP_QUERY, { base, filter: base, sort: SORTS.position.sort, pageSize: 1, page: 1 }, { tags, revalidate: 300, locale }).catch(() => null);
    const facets: Facet[] = visibleFacets(facetsOnly?.facets?.aggregations ?? []);
    const selected = selectedFilters(search, facets);
    const plp = await magentoFetch<any>(
      PLP_QUERY,
      { base, filter: toGraphqlFilter(cat.uid, selected), sort: SORTS[sort].sort, pageSize: PAGE_SIZE, page },
      { tags, revalidate: 300, locale }
    ).catch(() => null);
    const items = plp?.products?.items ?? [];
    const total = plp?.products?.total_count ?? 0;
    const pages = plp?.products?.page_info?.total_pages ?? 1;
    const here = `/${locale}${path}`;
    const currency = items[0]?.price_range?.minimum_price?.final_price?.currency ?? "USD";
    // Magento price buckets are "0_100" / "100_200" (open-ended ends are "*").
    const priceLabel = (value: string) => value.split("_").map((n) => (n === "*" || n === "" ? "" : money({ value: Number(n), currency }, locale))).filter(Boolean).join(" – ") || value;
    const sortHrefs = Object.fromEntries((Object.keys(SORTS) as SortKey[]).map((k) => [k, plpHref(here, { selected, sort: k })])) as Record<SortKey, string>;

    return (
      <div className="hd-container">
        <Breadcrumbs items={crumbs} />
        <header className="hd-plp__head">
          <h1>{cat.name}</h1>
          {cat.description ? <div className="hd-plp__desc" dangerouslySetInnerHTML={{ __html: cat.description }} /> : null}
        </header>
        <div className={`hd-plp${facets.length ? "" : " hd-plp--nofilters"}`}>
          <aside className="hd-plp__aside" aria-label="Product filters">
            <Filters path={here} facets={facets} selected={selected} sort={sort} priceLabel={priceLabel} />
          </aside>
          <div>
            <div className="hd-plp__bar">
              <p className="hd-plp__count" role="status">{total} Result{total === 1 ? "" : "s"}</p>
              <SortSelect value={sort} hrefs={sortHrefs} />
            </div>
            <ProductGrid items={items} locale={locale} variant={preset} />
            <Pagination current={Math.min(page, pages)} total={pages} href={(p) => plpHref(here, { selected, sort, page: p })} />
          </div>
        </div>
      </div>
    );
  }
  const cmsId = url?.[url.length - 1]?.replace(/\.html$/, "") ?? "home";
  const cms = await magentoFetch<any>(CMS_QUERY, { id: cmsId }, { tags: [`cms:${cmsId}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
  if (cms?.cmsPage) {
    return (
      // Venia CmsPage: PageBuilder content only; a heading only when content_heading is set.
      <article id="html-body" className="hd-cms">
        {cms.cmsPage.content_heading ? <h1 className="hd-cms__heading">{cms.cmsPage.content_heading}</h1> : null}
        <div dangerouslySetInnerHTML={{ __html: preparePageBuilder(cms.cmsPage.content ?? "") }} />
      </article>
    );
  }
  return <Message title={kind} text={path} />;
}
