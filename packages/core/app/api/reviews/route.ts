import { getConfig } from "../../../lib/magento.js";
import { CREATE_REVIEW_MUTATION } from "../../../graphql/catalog.js";
export async function POST(req: Request) {
  const c = getConfig();
  const body = await req.json();
  const token = req.headers.get("authorization") ?? "";
  const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Store: c.NEXT_PUBLIC_STORE, ...(token ? { Authorization: token } : {}) },
    body: JSON.stringify({ query: CREATE_REVIEW_MUTATION, variables: { sku: body.sku, nick: body.nickname, sum: body.summary, text: body.text, ratings: body.ratings } }),
  });
  const json = await res.json();
  if (json.errors?.length) return Response.json({ ok: false, errors: json.errors }, { status: 400 });
  return Response.json({ ok: true });
}
