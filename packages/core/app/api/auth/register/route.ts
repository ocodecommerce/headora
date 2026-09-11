import { getConfig } from "../../../../lib/magento.js";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "../../../../graphql/auth.js";
export async function POST(req: Request) {
  const c = getConfig();
  const input = await req.json();
  const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: c.NEXT_PUBLIC_STORE },
    body: JSON.stringify({ query: REGISTER_MUTATION, variables: { input } }),
  });
  const json = await res.json();
  if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 400 });
  const login = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: c.NEXT_PUBLIC_STORE },
    body: JSON.stringify({ query: LOGIN_MUTATION, variables: { email: input.email, password: input.password } }),
  });
  const lj = await login.json();
  const out = Response.json({ ok: true });
  const token = lj.data?.generateCustomerToken?.token;
  if (token) out.headers.append("Set-Cookie", `headora_customer_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
  return out;
}
