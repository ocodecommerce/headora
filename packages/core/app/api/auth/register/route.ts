import { getConfig, storeForLocale } from "../../../../lib/magento.js";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "../../../../graphql/auth.js";
export const revalidate = 0;
export async function POST(req: Request) {
  try {
    const c = getConfig();
    const body = await req.json().catch(() => ({}));
    const locale = typeof body.locale === "string" ? body.locale : undefined;
    const { store } = storeForLocale(locale);
    const input = {
      firstname: String(body.firstname ?? "").trim(),
      lastname: String(body.lastname ?? "").trim(),
      email: String(body.email ?? "").trim(),
      password: String(body.password ?? ""),
    };
    if (!input.firstname || !input.lastname || !input.email || !input.password) {
      return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }
    const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store },
      body: JSON.stringify({ query: REGISTER_MUTATION, variables: { input } }),
    });
    if (!res.ok) return Response.json({ ok: false, error: `MAGENTO_${res.status}` }, { status: 502 });
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "NON_JSON" }, { status: 502 });
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 400 });
    const login = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store },
      body: JSON.stringify({ query: LOGIN_MUTATION, variables: { email: input.email, password: input.password } }),
    });
    if (!login.ok) return Response.json({ ok: true, loggedIn: false });
    const lj = await login.json().catch(() => null);
    const out = Response.json({ ok: true, loggedIn: Boolean(lj?.data?.generateCustomerToken?.token) });
    const token = lj?.data?.generateCustomerToken?.token;
    if (token) out.headers.append("Set-Cookie", `headora_customer_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
    return out;
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 500 });
  }
}
