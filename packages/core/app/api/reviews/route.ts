import { cookies } from "next/headers";
import { getConfig } from "../../../lib/magento.js";
import { CREATE_REVIEW_MUTATION } from "../../../graphql/catalog.js";
// Login-required only. Token from HttpOnly cookie (set at login) or Authorization header.
export async function POST(req: Request) {
  const jar = await cookies();
  const cookieToken = jar.get("headora_customer_token")?.value ?? "";
  const headerToken = req.headers.get("authorization") ?? "";
  const token = headerToken || (cookieToken ? `Bearer ${cookieToken}` : "");
  if (!token) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  const c = getConfig();
  const body = await req.json();
  if (!body.sku || !body.nickname || !body.summary || !body.text || !Array.isArray(body.ratings) || !body.ratings.length) {
    return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }
  const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: c.NEXT_PUBLIC_STORE, Authorization: token },
    body: JSON.stringify({ query: CREATE_REVIEW_MUTATION, variables: { sku: body.sku, nick: body.nickname, sum: body.summary, text: body.text, ratings: body.ratings } }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const msg = JSON.stringify(json.errors);
    if (/authori|authentic|login|token/i.test(msg)) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
    return Response.json({ ok: false, errors: json.errors }, { status: 400 });
  }
  return Response.json({ ok: true });
}
