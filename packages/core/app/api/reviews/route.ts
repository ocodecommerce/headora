import { cookies } from "next/headers";
import { getConfig, storeForLocale } from "../../../lib/magento.js";
import { CREATE_REVIEW_MUTATION } from "../../../graphql/catalog.js";
export const revalidate = 0;
// Login-required only. Token from HttpOnly cookie or Authorization header. Store resolved per locale.
export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const cookieToken = jar.get("headora_customer_token")?.value ?? "";
    const headerToken = req.headers.get("authorization") ?? "";
    const token = headerToken || (cookieToken ? `Bearer ${cookieToken}` : "");
    if (!token) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
    const c = getConfig();
    const body = await req.json();
    const locale = typeof body.locale === "string" ? body.locale : undefined;
    const { store } = storeForLocale(locale);
    const sku = String(body.sku ?? "").trim();
    const nickname = String(body.nickname ?? "").trim();
    const summary = String(body.summary ?? "").trim();
    const text = String(body.text ?? "").trim();
    if (!sku || !nickname || !summary || !text || !Array.isArray(body.ratings) || !body.ratings.length) {
      return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }
    const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store, Authorization: token },
      body: JSON.stringify({ query: CREATE_REVIEW_MUTATION, variables: { sku, nick: nickname, sum: summary, text, ratings: body.ratings } }),
    });
    if (!res.ok) return Response.json({ ok: false, error: `MAGENTO_${res.status}` }, { status: 502 });
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "NON_JSON" }, { status: 502 });
    if (json.errors?.length) {
      const msg = JSON.stringify(json.errors);
      if (/authori|authentic|login|token/i.test(msg)) return Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
      return Response.json({ ok: false, errors: json.errors }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 500 });
  }
}
