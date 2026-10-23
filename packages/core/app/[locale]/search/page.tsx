import { magentoFetch, storeForLocale } from "../../../lib/magento.js";
import { SEARCH_QUERY } from "../../../graphql/catalog.js";
import { Filters } from "../../../components/catalog/Filters.js";
import { SortSelect } from "../../../components/catalog/SortSelect.js";
import { MobilePlpBar } from "../../../components/catalog/MobilePlpBar.js";
import { Pagination } from "../../../components/catalog/Pagination.js";
import { ProductGrid } from "../../../components/catalog/ProductGrid.js";
import { money } from "../../../components/catalog/ProductCard.js";
import { SearchIcon } from "../../../components/layout/Icons.js";
import { SORTS, pageNumber, plpHref, selectedFilters, sortKey, toGraphqlFilter, visibleFacets, type Facet, type Search, type SortKey } from "../../../lib/plp.js";
import { getPresetName } from "../../../lib/theme.js";

export const revalidate = 0;

const PAGE_SIZE = 21; // same page size as category pages / the legacy storefront

// Search results, laid out like the legacy /search page: search box + count, then the category layout.
export default async function SearchPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const q = (Array.isArray(search.query) ? search.query[0] : search.query ?? "").trim().slice(0, 100);
  const here = `/${locale}/search?query=${encodeURIComponent(q)}`;
  const { currency } = storeForLocale(locale);
  const preset = getPresetName();

  const sort: SortKey = sortKey(search);
  const page = pageNumber(search);
  const first = q
    ? await magentoFetch<any>(SEARCH_QUERY, { q, filter: {}, sort: SORTS.position.sort, pageSize: 1, page: 1 }, { revalidate: 60, locale, tags: ["search"] }).catch(() => null)
    : null;
  const facets: Facet[] = visibleFacets(first?.facets?.aggregations ?? []);
  const selected = selectedFilters(search, facets);
  const data = q
    // "Position" on search means Magento's relevance order, as on the legacy search page.
    ? await magentoFetch<any>(SEARCH_QUERY, { q, filter: toGraphqlFilter(null, selected), sort: sort === "position" ? { relevance: "DESC" } : SORTS[sort].sort, pageSize: PAGE_SIZE, page }, { revalidate: 60, locale, tags: ["search"] }).catch(() => null)
    : null;
  const items = data?.products?.items ?? [];
  const total = data?.products?.total_count ?? 0;
  const pages = data?.products?.page_info?.total_pages ?? 1;
  const priceLabel = (value: string) => value.split("_").map((n) => (n === "*" || n === "" ? "" : money({ value: Number(n), currency }, locale))).filter(Boolean).join(" – ") || value;
  const sortHrefs = Object.fromEntries((Object.keys(SORTS) as SortKey[]).map((k) => [k, plpHref(here, { selected, sort: k })])) as Record<SortKey, string>;

  return (
    <div className="hd-container hd-search">
      <div className="hd-search__head">
        <p className="hd-search__count">{q ? <>Showing result for &quot;{q}&quot;: {total} items</> : null}</p>
        <form className="hd-search__form" action={`/${locale}/search`} role="search">
          <SearchIcon />
          <input name="query" defaultValue={q} placeholder="Search products..." aria-label="Search products" />
          <button type="submit">Search</button>
        </form>
      </div>
      {q ? (
        <>
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
              {items.length ? <ProductGrid items={items} locale={locale} variant={preset} /> : <p className="hd-search__empty">No products match &quot;{q}&quot;.</p>}
              <Pagination current={Math.min(page, pages)} total={pages} href={(p) => plpHref(here, { selected, sort, page: p })} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await searchParams;
  const q = Array.isArray(s.query) ? s.query[0] : s.query;
  return { title: q ? `Search results for "${q}"` : "Search", robots: { index: false } };
}
