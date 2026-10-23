// URL <-> layered-navigation state for category pages.
// ?fashion_color=24,25&price=0_100&sort=price_asc&page=2
// Only attribute codes/values that Magento returned as facets are honoured, so
// arbitrary query params can never reach the GraphQL filter.

export type Facet = { attribute_code: string; label: string; options: { label: string; value: string; count: number }[] };
export type Search = Record<string, string | string[] | undefined>;

// Facets that make no sense as sidebar filters here (category drill-down is the menu).
const HIDDEN = new Set(["category_uid", "category_id"]);

export const SORTS = {
  position: { label: "Position", sort: { position: "ASC" } },
  price_desc: { label: "Price High to Low", sort: { price: "DESC" } },
  price_asc: { label: "Price Low to High", sort: { price: "ASC" } },
  name_asc: { label: "Product Name A-Z", sort: { name: "ASC" } },
  name_desc: { label: "Product Name Z-A", sort: { name: "DESC" } },
} as const;
export type SortKey = keyof typeof SORTS;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function visibleFacets(facets: Facet[]): Facet[] {
  // Price stays even with one bucket: it is a slider, like the legacy storefront.
  return facets.filter((f) => !HIDDEN.has(f.attribute_code) && (f.options.length > 1 || (f.attribute_code === "price" && f.options.length > 0)));
}

// attribute_code -> selected values, validated against facets.
export function selectedFilters(search: Search, facets: Facet[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const f of visibleFacets(facets)) {
    const allowed = new Set(f.options.map((o) => o.value));
    // Price also accepts any "from_to" range set by the price slider.
    const ok = (v: string) => allowed.has(v) || (f.attribute_code === "price" && /^\d+(\.\d+)?_\d+(\.\d+)?$/.test(v));
    const picked = first(search[f.attribute_code]).split(",").filter(ok);
    if (picked.length) out[f.attribute_code] = f.attribute_code === "price" ? picked.slice(0, 1) : picked;
  }
  return out;
}

export function sortKey(search: Search): SortKey {
  const s = first(search.sort);
  return s in SORTS ? (s as SortKey) : "position";
}

export function pageNumber(search: Search): number {
  const n = Number.parseInt(first(search.page), 10);
  return Number.isFinite(n) && n > 0 && n < 10000 ? n : 1;
}

// Magento filter input: select attributes use `in`; price "0_100" becomes a range.
export function toGraphqlFilter(categoryUid: string | null, selected: Record<string, string[]>) {
  const filter: Record<string, unknown> = categoryUid ? { category_uid: { eq: categoryUid } } : {};
  for (const [code, values] of Object.entries(selected)) {
    if (code === "price") {
      const [from, to] = values[0].split("_");
      filter.price = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
    } else {
      filter[code] = { in: values };
    }
  }
  return filter;
}

// Build a category URL from the current state with overrides (always resets to page 1
// unless a page is given).
export function plpHref(path: string, state: { selected: Record<string, string[]>; sort: SortKey; page?: number }): string {
  const q = new URLSearchParams();
  for (const [code, values] of Object.entries(state.selected)) if (values.length) q.set(code, values.join(","));
  if (state.sort !== "position") q.set("sort", state.sort);
  if (state.page && state.page > 1) q.set("page", String(state.page));
  const s = q.toString();
  return s ? `${path}${path.includes("?") ? "&" : "?"}${s}` : path;
}

export function toggle(selected: Record<string, string[]>, code: string, value: string): Record<string, string[]> {
  const cur = selected[code] ?? [];
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : code === "price" ? [value] : [...cur, value];
  const out = { ...selected };
  if (next.length) out[code] = next; else delete out[code];
  return out;
}
