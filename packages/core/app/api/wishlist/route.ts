import { getConfig, storeForLocale } from "../../../lib/magento.js";
import { readCookie } from "../../../lib/cart.js";
import { ADD_TO_WISHLIST_MUTATION, REMOVE_FROM_WISHLIST_MUTATION, WISHLIST_QUERY } from "../../../graphql/wishlist.js";

export const revalidate = 0;

const TOKEN_COOKIE = "headora_customer_token";
type Wishlist = { id: string; items_v2?: { items: { id: string; product: { sku: string } | null }[] } } | null;

// sku -> wishlist item id, for the heart toggles on product cards.
const toItems = (w: Wishlist) =>
  Object.fromEntries((w?.items_v2?.items ?? []).filter((i) => i.product?.sku).map((i) => [i.product!.sku, i.id]));

const unauthorized = () => {
  const out = Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  out.headers.append("Set-Cookie", `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return out;
};

async function gql(token: string, store: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(getConfig().MAGENTO_GRAPHQL_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Store: store, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error(`MAGENTO_${res.status}`);
  // Expired/invalid token: Magento answers with an authorization error.
  const authFail = json.errors?.some((e: any) =>
    e.extensions?.category === "graphql-authorization" || /isn't authorized|not authorized|could not read a token|token .*(expired|invalid)/i.test(e.message));
  return { json, authFail };
}

const localeOf = (v: unknown) => (typeof v === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(v) ? v : undefined);

async function current(token: string, store: string) {
  const { json, authFail } = await gql(token, store, WISHLIST_QUERY);
  return { authFail, wishlist: (json.data?.customer?.wishlists?.[0] ?? null) as Wishlist, error: json.errors?.[0]?.message };
}

// GET /api/wishlist?locale=en -> { ok, items: { [sku]: itemId } } (401 when signed out)
export async function GET(req: Request) {
  const token = readCookie(req, TOKEN_COOKIE);
  if (!token) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  const { store } = storeForLocale(localeOf(new URL(req.url).searchParams.get("locale")));
  try {
    const { authFail, wishlist, error } = await current(token, store);
    if (authFail) return unauthorized();
    if (error) return Response.json({ ok: false, error }, { status: 502 });
    return Response.json({ ok: true, items: toItems(wishlist) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}

// POST /api/wishlist { locale, sku } add; DELETE /api/wishlist { locale, sku } remove.
async function change(req: Request, remove: boolean) {
  const token = readCookie(req, TOKEN_COOKIE);
  if (!token) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  if (!sku || sku.length > 64) return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  const { store } = storeForLocale(localeOf(body.locale));
  try {
    const now = await current(token, store);
    if (now.authFail) return unauthorized();
    if (!now.wishlist?.id) return Response.json({ ok: false, error: now.error ?? "Wishlist unavailable." }, { status: 502 });
    const items = toItems(now.wishlist);
    if (remove ? !items[sku] : items[sku]) return Response.json({ ok: true, items });
    const { json, authFail } = remove
      ? await gql(token, store, REMOVE_FROM_WISHLIST_MUTATION, { id: now.wishlist.id, itemId: items[sku] })
      : await gql(token, store, ADD_TO_WISHLIST_MUTATION, { id: now.wishlist.id, sku });
    if (authFail) return unauthorized();
    const result = json.data?.[remove ? "removeProductsFromWishlist" : "addProductsToWishlist"];
    const error = result?.user_errors?.[0]?.message ?? json.errors?.[0]?.message;
    if (error) return Response.json({ ok: false, error, items }, { status: 422 });
    return Response.json({ ok: true, items: toItems(result?.wishlist ?? null) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}
export const POST = (req: Request) => change(req, false);
export const DELETE = (req: Request) => change(req, true);
