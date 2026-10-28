import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig, magentoFetch, URL_RESOLVE_QUERY } from "../../../lib/magento.js";
import { ProductView } from "../../../components/product/ProductView.js";
import { PDP_QUERY, REVIEWS_QUERY, CATEGORY_QUERY, CMS_QUERY, PLP_QUERY } from "../../../graphql/catalog.js";
import { Filters } from "../../../components/catalog/Filters.js";
import { SortSelect } from "../../../components/catalog/SortSelect.js";
import { MobilePlpBar } from "../../../components/catalog/MobilePlpBar.js";
import { Pagination } from "../../../components/catalog/Pagination.js";
import { money } from "../../../components/catalog/ProductCard.js";
import { SORTS, pageNumber, plpHref, selectedFilters, sortKey, toGraphqlFilter, visibleFacets, type Facet, type Search, type SortKey } from "../../../lib/plp.js";
import { getPresetName } from "../../../lib/theme.js";
import { PdpTabs } from "../../../components/product/PdpTabs.js";
import { ProductGrid } from "../../../components/catalog/ProductGrid.js";
import { Breadcrumbs, type Crumb } from "../../../components/layout/Breadcrumbs.js";
import { PageBuilder } from "../../../components/blocks/PageBuilder.js";
import { alternates, breadcrumbLd, describe, JsonLd, siteName, siteUrl } from "../../../lib/seo.js";
export const revalidate = 120;

type Params = { params: Promise<{ locale: string; url: string[] }> };
// Loaders shared by generateMetadata and the page: cache() makes it one Magento call per request.
const resolveUrl = cache(async (locale: string, path: string) => {
  const resolve = (u: string) => magentoFetch<{ urlResolver: { type: string; id?: number; relative_url?: string | null } | null }>(
    URL_RESOLVE_QUERY, { url: u }, { tags: [`url:${u}`, `locale:${locale}`], revalidate: 120, locale }
  ).catch(() => ({ urlResolver: null }));
  let resolved = await resolve(path);
  // CMS content often links categories/products without the ".html" suffix Magento stores.
  if (!resolved.urlResolver && !/\.[a-z0-9]+$/i.test(path)) resolved = await resolve(`${path}.html`);
  return resolved.urlResolver;
});
const loadProduct = cache(async (locale: string, slug: string) => {
  const pdp = await magentoFetch<any>(PDP_QUERY, { urlKey: slug }, { tags: [`pdp:${slug}`, `locale:${locale}`], revalidate: 120, locale }).catch(() => null);
  // url_key filter also returns parents (bundle/grouped/configurable) containing the product: match exactly.
  const items: any[] = pdp?.products?.items ?? [];
  return { pdp, item: items.find((i) => i?.url_key === slug) ?? items[0] ?? null };
});
const loadCategory = cache(async (locale: string, path: string) => {
  const data = await magentoFetch<any>(CATEGORY_QUERY, { id: path.replace(/^\//, "").replace(/\.html$/, "") }, { tags: [`cat:${path}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
  return data?.categories?.items?.[0] ?? null;
});
const loadCms = cache(async (locale: string, id: string) => {
  const cms = await magentoFetch<any>(CMS_QUERY, { id }, { tags: [`cms:${id}`, `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
  return cms?.cmsPage ?? null;
});
const slugOf = (url?: string[]) => url?.[url.length - 1]?.replace(/\.html$/, "") ?? "";
// Canonical path: Magento's own URL for the entity (adds a missing ".html", drops query strings).
const canonicalPath = (r: { relative_url?: string | null }, path: string) => (r.relative_url ? `/${r.relative_url.replace(/^\//, "")}` : path);

export async function generateMetadata({ params, searchParams }: Params & { searchParams: Promise<Search> }): Promise<Metadata> {
  const { locale, url } = await params;
  const path = `/${url?.join("/") ?? ""}`;
  const notFoundMeta: Metadata = { title: "Page not found", robots: { index: false } };
  const r = await resolveUrl(locale, path);
  if (!r) return notFoundMeta;
  const alt = alternates(locale, canonicalPath(r, path));
  const social = (title: string, description?: string, image?: string | null): Metadata => ({
    openGraph: { type: "website", siteName: siteName(), url: alt.canonical, title, description, locale, images: image ? [{ url: image, alt: title }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  });
  if (r.type === "PRODUCT") {
    const { item } = await loadProduct(locale, slugOf(url));
    if (!item) return notFoundMeta;
    const title = item.meta_title || item.name;
    const description = describe(item.meta_description, item.short_description?.html, item.description?.html);
    return { title, description, alternates: alt, ...social(title, description, item.image?.url ?? item.small_image?.url ?? item.media_gallery?.[0]?.url) };
  }
  if (r.type === "CATEGORY") {
    const cat = await loadCategory(locale, path);
    if (!cat?.uid) return notFoundMeta;
    const search = await searchParams;
    const page = pageNumber(search);
    const title = (cat.meta_title || cat.name) + (page > 1 ? ` - Page ${page}` : "");
    const description = describe(cat.meta_description, cat.description);
    // Filtered/sorted listings are near-duplicates: keep them out of the index, still follow links.
    const narrowed = Object.keys(search).some((k) => k !== "page");
    return {
      title, description,
      alternates: page > 1 ? { ...alt, canonical: `${alt.canonical}?page=${page}` } : alt,
      ...(narrowed ? { robots: { index: false, follow: true } } : {}),
      ...social(title, description, cat.image),
    };
  }
  const cms = await loadCms(locale, slugOf(url) || "home");
  if (!cms) return notFoundMeta;
  const title = cms.meta_title || cms.title;
  const description = describe(cms.meta_description, cms.content);
  return { title, description, alternates: alt, ...social(title, description) };
}

const PAGE_SIZE = 21; // legacy storefront page size
export default async function CatchAll({ params, searchParams }: Params & { searchParams: Promise<Search> }) {
  const { locale, url } = await params;
  const path = `/${url?.join("/") ?? ""}`;
  const preset = getPresetName();
  const home: Crumb = { label: "Home", href: `/${locale}` };
  const resolved = await resolveUrl(locale, path);
  if (!resolved) notFound();
  const kind = resolved.type;
  const origin = await siteUrl();
  if (kind === "PRODUCT") {
    const { pdp, item } = await loadProduct(locale, slugOf(url));
    if (!item) notFound();
    const rev = await magentoFetch<any>(REVIEWS_QUERY, { sku: item.sku }, { tags: [`reviews:${item.sku}`, `locale:${locale}`], revalidate: 60, locale }).catch(() => null);
    const node = rev?.products?.items?.[0] ?? { reviews: { items: [] }, review_count: 0, rating_summary: 0 };
    // Deepest assigned category gives the breadcrumb trail.
    const cat = item.categories?.[0]; // legacy breadcrumb: the product's first category
    const crumbs: Crumb[] = [home, ...(cat ? [{ label: cat.name, href: `/${locale}/${cat.url_path}.html` }] : []), { label: item.name }];
    const reviewCount = node.review_count ?? 0;
    const price = item.price_range?.minimum_price?.final_price;
    const pageUrl = `${origin}/${locale}${canonicalPath(resolved, path)}`;
    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: item.name,
      sku: item.sku,
      url: pageUrl,
      image: [item.image?.url, ...(item.media_gallery ?? []).map((m: any) => m.url)].filter((u, i, a) => u && a.indexOf(u) === i && !/placeholder/.test(u)),
      description: describe(item.meta_description, item.short_description?.html, item.description?.html),
      ...(price ? { offers: {
        "@type": "Offer", url: pageUrl, price: price.value, priceCurrency: price.currency, itemCondition: "https://schema.org/NewCondition",
        availability: item.stock_status === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      } } : {}),
      // Magento rating_summary is 0-100.
      ...(reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(((node.rating_summary ?? 0) / 20).toFixed(1)), bestRating: 5, reviewCount } } : {}),
    };
    return (
      <div className="hd-container hd-container--pdp">
        <JsonLd data={productLd} />
        <JsonLd data={breadcrumbLd(origin, crumbs)} />
        <Breadcrumbs items={crumbs} />
        <ProductView item={{ ...item, short_description: null }} reviewCount={reviewCount} locale={locale} magentoBaseUrl={getConfig().MAGENTO_BASE_URL} />
        <PdpTabs
          description={item.description?.html ?? ""}
          details={(pdp?.products?.aggregations ?? [])
            // Legacy Details tab: the product's own layered-navigation values, minus price/category.
            .filter((a: any) => !["price", "category_id", "category_uid"].includes(a.attribute_code))
            .map((a: any) => ({ label: a.label, values: (a.options ?? []).map((o: any) => o.label).filter((l: string) => l && l !== "0") }))
            .filter((a: any) => a.values.length)}
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
    const cat = await loadCategory(locale, path);
    const crumbs: Crumb[] = [
      home,
      ...(cat?.breadcrumbs ?? []).map((b: any) => ({ label: b.category_name, href: `/${locale}/${b.category_url_path}.html` })),
      { label: cat?.name ?? "" },
    ];
    if (!cat?.uid) notFound();

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
        <JsonLd data={breadcrumbLd(origin, crumbs)} />
        <Breadcrumbs items={crumbs} />
        <header className="hd-plp__head">
          <h1>{cat.name}</h1>
          {cat.description ? <div className="hd-plp__desc" dangerouslySetInnerHTML={{ __html: cat.description }} /> : null}
        </header>
        <div className="hd-plp__bar">
          <p className="hd-plp__count" role="status">{total} Result{total === 1 ? "" : "s"}</p>
          <SortSelect value={sort} hrefs={sortHrefs} />
        </div>
        <MobilePlpBar total={total} sort={sort} hrefs={sortHrefs} />
        <div className={`hd-plp${facets.length ? "" : " hd-plp--nofilters"}`}>
          <aside className="hd-plp__aside" aria-label="Product filters">
            <Filters path={here} facets={facets} selected={selected} sort={sort} priceLabel={priceLabel}
              currencySymbol={(money({ value: 0, currency }, locale) ?? "$").replace(/[\d.,\s]/g, "")} />
          </aside>
          <div>
            <ProductGrid items={items} locale={locale} variant={preset} />
            <Pagination current={Math.min(page, pages)} total={pages} href={(p) => plpHref(here, { selected, sort, page: p })} />
          </div>
        </div>
      </div>
    );
  }
  const cmsPage = await loadCms(locale, slugOf(url) || "home");
  if (cmsPage) {
    return (
      // Venia CmsPage: PageBuilder content only; a heading only when content_heading is set.
      <article id="html-body" className="hd-cms">
        {cmsPage.content_heading ? <h1 className="hd-cms__heading">{cmsPage.content_heading}</h1> : null}
        <PageBuilder html={cmsPage.content ?? ""} locale={locale} variant={preset} />
      </article>
    );
  }
  notFound();
}
