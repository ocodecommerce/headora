import { storeForLocale } from "../../../lib/magento.js";
import { ADD_TO_CART_MUTATION, CART_QUERY, CREATE_CART_MUTATION, REMOVE_FROM_CART_MUTATION } from "../../../graphql/cart.js";
import { CART_COOKIE, EMPTY_CART, cartCookie, cartGql, isDeadCart, readCookie, toSummary } from "../../../lib/cart.js";

export const revalidate = 0;

function localeOf(v: unknown): string | undefined {
  return typeof v === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(v) ? v : undefined;
}

// GET /api/cart?locale=en -> current guest cart summary (empty when there is none).
export async function GET(req: Request) {
  const { store } = storeForLocale(localeOf(new URL(req.url).searchParams.get("locale")));
  const id = readCookie(req, CART_COOKIE);
  if (!id) return Response.json({ ok: true, cart: EMPTY_CART });
  try {
    const json = await cartGql(CART_QUERY, { id }, store);
    if (isDeadCart(json.errors)) {
      const out = Response.json({ ok: true, cart: EMPTY_CART });
      out.headers.append("Set-Cookie", cartCookie(req, null));
      return out;
    }
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 502 });
    return Response.json({ ok: true, cart: toSummary(json.data?.cart) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}

// POST /api/cart { locale, sku, quantity, selected_options: string[] } -> add to the guest cart.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const quantity = Number(body.quantity ?? 1);
  const options: unknown[] = Array.isArray(body.selected_options) ? body.selected_options : [];
  if (!sku || sku.length > 64 || !Number.isInteger(quantity) || quantity < 1 || quantity > 999
    || options.length > 20 || !options.every((o) => typeof o === "string" && o.length <= 128)) {
    return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }
  const { store } = storeForLocale(localeOf(body.locale));
  const item = { sku, quantity, ...(options.length ? { selected_options: options } : {}) };

  try {
    let id = readCookie(req, CART_COOKIE);
    let fresh = false;
    const newCart = async () => {
      const json = await cartGql(CREATE_CART_MUTATION, {}, store);
      const created = json.data?.createEmptyCart;
      if (!created) throw new Error(json.errors?.[0]?.message ?? "CART_CREATE_FAILED");
      fresh = true;
      return created as string;
    };
    if (!id) id = await newCart();

    let json = await cartGql(ADD_TO_CART_MUTATION, { id, items: [item] }, store);
    if (isDeadCart(json.errors)) {
      // Stale cookie (cart ordered/expired): start over once.
      id = await newCart();
      json = await cartGql(ADD_TO_CART_MUTATION, { id, items: [item] }, store);
    }

    const result = json.data?.addProductsToCart;
    const userError = result?.user_errors?.[0]?.message ?? json.errors?.[0]?.message;
    const out = Response.json(
      userError ? { ok: false, error: userError, cart: toSummary(result?.cart) } : { ok: true, cart: toSummary(result?.cart) },
      { status: userError ? 422 : 200 }
    );
    if (fresh) out.headers.append("Set-Cookie", cartCookie(req, id));
    return out;
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}

// DELETE /api/cart { locale, uid } -> remove one line from the guest cart.
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const uid = typeof body.uid === "string" ? body.uid : "";
  const id = readCookie(req, CART_COOKIE);
  if (!uid || uid.length > 128) return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  if (!id) return Response.json({ ok: true, cart: EMPTY_CART });
  const { store } = storeForLocale(localeOf(body.locale));
  try {
    const json = await cartGql(REMOVE_FROM_CART_MUTATION, { id, uid }, store);
    if (isDeadCart(json.errors)) {
      const out = Response.json({ ok: true, cart: EMPTY_CART });
      out.headers.append("Set-Cookie", cartCookie(req, null));
      return out;
    }
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 422 });
    return Response.json({ ok: true, cart: toSummary(json.data?.removeItemFromCart?.cart) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}
