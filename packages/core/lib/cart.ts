import { getConfig } from "./config.js";

// Masked guest cart id lives in an httpOnly cookie; the browser never sees it.
export const CART_COOKIE = "headora_cart";

export type CartSummary = {
  count: number;
  total: { value: number | null; currency: string | null } | null;
  items: {
    uid: string;
    quantity: number;
    name: string;
    sku: string;
    url_key: string;
    image: string | null;
    rowTotal: { value: number | null; currency: string | null } | null;
    options: string[];
  }[];
};

export const EMPTY_CART: CartSummary = { count: 0, total: null, items: [] };

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function cartCookie(req: Request, id: string | null): string {
  const https = (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "")) === "https";
  const value = id ? encodeURIComponent(id) : "";
  const maxAge = id ? 60 * 60 * 24 * 30 : 0;
  return `${CART_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${https ? "; Secure" : ""}`;
}

// Uncached GraphQL call (cart reads/writes must never hit the Next data cache).
export async function cartGql(query: string, variables: Record<string, unknown>, store: string): Promise<{ data?: any; errors?: { message: string }[] }> {
  const res = await fetch(getConfig().MAGENTO_GRAPHQL_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Store: store },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`MAGENTO_${res.status}`);
  return res.json();
}

// Cart gone (ordered, expired, other store): caller should drop the cookie / start a new cart.
export function isDeadCart(errors?: { message: string }[]): boolean {
  return !!errors?.some((e) => /could not find a cart|isn't active|is not active|not allowed to access/i.test(e.message));
}

export function toSummary(cart: any): CartSummary {
  if (!cart) return EMPTY_CART;
  return {
    count: cart.total_quantity ?? 0,
    total: cart.prices?.subtotal_excluding_tax ?? null,
    items: (cart.items ?? []).filter(Boolean).map((i: any) => ({
      uid: i.uid,
      quantity: i.quantity,
      name: i.product?.name ?? "",
      // Configurable lines show the chosen variant (its SKU and image).
      sku: i.configured_variant?.sku ?? i.product?.sku ?? "",
      url_key: i.product?.url_key ?? "",
      image: i.configured_variant?.small_image?.url ?? i.product?.small_image?.url ?? null,
      rowTotal: i.prices?.row_total ?? null,
      options: (i.configurable_options ?? []).map((o: any) => `${o.option_label}: ${o.value_label}`),
    })),
  };
}
