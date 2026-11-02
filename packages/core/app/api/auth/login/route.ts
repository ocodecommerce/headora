import { getConfig, storeForLocale } from "../../../../lib/magento.js";
import { LOGIN_MUTATION } from "../../../../graphql/auth.js";
import { NAME_QUERY } from "../../../../graphql/account.js";
import { customerCartCookie, customerGql, sessionCookies } from "../../../../lib/customer.js";
export const revalidate = 0;
export async function POST(req: Request) {
  try {
    const c = getConfig();
    const body = await req.json().catch(() => ({}));
    const locale = typeof body.locale === "string" ? body.locale : undefined;
    const { store } = storeForLocale(locale);
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email || !password) return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store },
      body: JSON.stringify({ query: LOGIN_MUTATION, variables: { email, password } }),
    });
    // Magento answers bad credentials with HTTP 401 + a GraphQL error; surface its message.
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "The store did not respond. Please try again." }, { status: 502 });
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 401 });
    const token = json.data?.generateCustomerToken?.token;
    if (!token) return Response.json({ ok: false, error: "LOGIN_FAILED" }, { status: 401 });
    // First name for the header greeting; a failure here must not block the login.
    const me = await customerGql(token, store, NAME_QUERY).catch(() => null);
    const out = Response.json({ ok: true });
    for (const ck of sessionCookies(req, token, me?.data?.customer?.firstname ?? "")) out.headers.append("Set-Cookie", ck);
    const cart = await customerCartCookie(req, token, store);
    if (cart) out.headers.append("Set-Cookie", cart);
    return out;
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 500 });
  }
}
