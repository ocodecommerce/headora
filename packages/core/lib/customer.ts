import { getConfig } from "./config.js";
import { originalImages } from "./magento.js";
import { CART_COOKIE, cartCookie, cartGql, readCookie } from "./cart.js";

// Customer session = Magento customer token in an httpOnly cookie. A second, readable cookie
// carries only the first name so the header can show "Hi, Name" without a request.
export const TOKEN_COOKIE = "headora_customer_token";
export const NAME_COOKIE = "headora_customer_name";
const MAX_AGE = 60 * 60; // Magento's default customer token lifetime (1 hour)

const secure = (req: Request) =>
  (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "")) === "https" ? "; Secure" : "";

export function sessionCookies(req: Request, token: string, firstname: string): string[] {
  return [
    `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure(req)}`,
    `${NAME_COOKIE}=${encodeURIComponent(firstname.slice(0, 40))}; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure(req)}`,
  ];
}
export function clearSessionCookies(req: Request): string[] {
  return [
    `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure(req)}`,
    `${NAME_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${secure(req)}`,
  ];
}

// Uncached, authenticated GraphQL call. `authFail` = token missing/expired/revoked.
export async function customerGql(token: string, store: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(getConfig().MAGENTO_GRAPHQL_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Store: store, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const json: { data?: any; errors?: { message: string; extensions?: { category?: string } }[] } = JSON.parse(originalImages(await res.text()));
  // A wrong current password (changeCustomerPassword) is also a 401, tagged graphql-authentication: not a dead session.
  const wrongPassword = !!json.errors?.some((e) => e.extensions?.category === "graphql-authentication");
  const authFail = (res.status === 401 && !wrongPassword) || !!json.errors?.some((e) => e.extensions?.category === "graphql-authorization" || /isn't authorized|not authorized/i.test(e.message));
  return { ...json, authFail };
}

// On sign-in: fold the guest basket into the customer's Magento cart and point the cart cookie at it,
// so checkout knows the email and the order lands in the customer's order history.
export async function customerCartCookie(req: Request, token: string, store: string): Promise<string | null> {
  try {
    const id = (await cartGql(`{ customerCart { id } }`, {}, store, token)).data?.customerCart?.id;
    if (!id) return null;
    const guest = readCookie(req, CART_COOKIE);
    if (guest && guest !== id) {
      await cartGql(`mutation Merge($src: String!, $dst: String!) { mergeCarts(source_cart_id: $src, destination_cart_id: $dst) { id } }`, { src: guest, dst: id }, store, token);
    }
    return cartCookie(req, id);
  } catch {
    return null; // a failed merge must not block the sign-in
  }
}
