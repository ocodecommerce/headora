import { storeForLocale } from "../../../lib/magento.js";
import { CART_COOKIE, cartCookie, cartGql, isDeadCart, readCookie } from "../../../lib/cart.js";
import { TOKEN_COOKIE } from "../../../lib/customer.js";
import { ADDRESS_MUTATION, CHECKOUT_QUERY, CUSTOMER_ADDRESS_MUTATION, SAVED_ADDRESS_QUERY, COUNTRIES_QUERY, PLACE_ORDER_MUTATION, SHIPPING_METHOD_MUTATION } from "../../../graphql/checkout.js";

export const revalidate = 0;

// Payment methods the headless checkout can take without a gateway form. Anything else
// (cards, PayPal, ...) is paid on the native Magento checkout via /api/handoff.
const OFFLINE_PAYMENTS = ["checkmo", "cashondelivery", "banktransfer", "free"];

const localeOf = (v: unknown) => (typeof v === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(v) ? v : undefined);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const fail = (error: string, status = 422) => Response.json({ ok: false, error }, { status });

// GET /api/checkout?locale=en -> { cart, countries } for the checkout page.
export async function GET(req: Request) {
  const { store } = storeForLocale(localeOf(new URL(req.url).searchParams.get("locale")));
  const id = readCookie(req, CART_COOKIE);
  const token = readCookie(req, TOKEN_COOKIE);
  if (!id) return Response.json({ ok: true, cart: null, countries: [] });
  try {
    const [cart, countries, saved] = await Promise.all([
      cartGql(CHECKOUT_QUERY, { id }, store, token), cartGql(COUNTRIES_QUERY, {}, store),
      token ? cartGql(SAVED_ADDRESS_QUERY, {}, store, token).catch(() => null) : null,
    ]);
    if (isDeadCart(cart.errors)) {
      const out = Response.json({ ok: true, cart: null, countries: [] });
      out.headers.append("Set-Cookie", cartCookie(req, null));
      return out;
    }
    if (cart.errors?.length) return fail(cart.errors[0].message, 502);
    const addresses: any[] = saved?.data?.customer?.addresses ?? [];
    return Response.json({
      ok: true, cart: cart.data?.cart ?? null, countries: countries.data?.countries ?? [], offline: OFFLINE_PAYMENTS,
      signedIn: !!token, savedAddress: addresses.find((a) => a.default_shipping) ?? addresses[0] ?? null,
    });
  } catch (e: any) {
    return fail(e.message ?? "FAILED", 502);
  }
}

// POST /api/checkout { locale, step: "address" | "shipping" | "place", ... }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { store } = storeForLocale(localeOf(body.locale));
  const id = readCookie(req, CART_COOKIE);
  const token = readCookie(req, TOKEN_COOKIE);
  if (!id) return fail("Your basket is empty.", 400);
  try {
    if (body.step === "address") {
      const a = body.address ?? {};
      const email = str(body.email, 254);
      const street = (Array.isArray(a.street) ? a.street : [a.street]).map((s: unknown) => str(s, 255)).filter(Boolean).slice(0, 3);
      const address = {
        firstname: str(a.firstname, 255), lastname: str(a.lastname, 255), street, city: str(a.city, 255),
        postcode: str(a.postcode, 32), country_code: str(a.country_code, 2).toUpperCase(), telephone: str(a.telephone, 64),
        save_in_address_book: false,
        ...(Number.isInteger(a.region_id) && a.region_id > 0 ? { region_id: a.region_id } : a.region ? { region: str(a.region, 255) } : {}),
      };
      if ((!token && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || !address.firstname || !address.lastname || !street.length || !address.city
        || !/^[A-Z]{2}$/.test(address.country_code) || !address.telephone) return fail("Please complete all required fields.", 400);
      const json = token
        ? await cartGql(CUSTOMER_ADDRESS_MUTATION, { id, address }, store, token)
        : await cartGql(ADDRESS_MUTATION, { id, email, address }, store);
      if (json.errors?.length) return fail(json.errors[0].message);
      return Response.json({ ok: true, cart: json.data?.setBillingAddressOnCart?.cart });
    }
    if (body.step === "shipping") {
      const carrier = str(body.carrier_code, 64);
      const method = str(body.method_code, 64);
      if (!carrier || !method) return fail("Choose a delivery method.", 400);
      const json = await cartGql(SHIPPING_METHOD_MUTATION, { id, carrier, method }, store, token);
      if (json.errors?.length) return fail(json.errors[0].message);
      return Response.json({ ok: true, cart: json.data?.setShippingMethodsOnCart?.cart });
    }
    if (body.step === "place") {
      const code = str(body.payment_code, 64);
      if (!OFFLINE_PAYMENTS.includes(code)) return fail("Choose a payment method.", 400);
      const json = await cartGql(PLACE_ORDER_MUTATION, { id, code }, store, token);
      const number = json.data?.placeOrder?.order?.order_number;
      if (!number) return fail(json.errors?.[0]?.message ?? "The order could not be placed.");
      // Ordered cart is inactive: drop the cookie so the next add starts a new basket.
      const out = Response.json({ ok: true, order_number: number });
      out.headers.append("Set-Cookie", cartCookie(req, null));
      return out;
    }
    return fail("INVALID_STEP", 400);
  } catch (e: any) {
    return fail(e.message ?? "FAILED", 502);
  }
}
