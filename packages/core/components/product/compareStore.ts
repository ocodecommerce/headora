// Compare list kept in the browser, like the legacy storefront (same localStorage key and shape).
export const COMPARE_KEY = "compareProducts";

export type CompareItem = {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  currency?: string | null;
  image?: string | null;
  url_key: string;
  description?: string | { html?: string } | null;
};

export function readCompare(): CompareItem[] {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function writeCompare(items: CompareItem[]) {
  try {
    if (items.length) localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
    else localStorage.removeItem(COMPARE_KEY);
    window.dispatchEvent(new Event("headora:compare"));
  } catch { /* storage blocked: compare is best-effort */ }
}
