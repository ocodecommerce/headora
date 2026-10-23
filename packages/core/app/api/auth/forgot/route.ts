import { getConfig, storeForLocale } from "../../../../lib/magento.js";
import { FORGOT_MUTATION } from "../../../../graphql/auth.js";
export const revalidate = 0;
export async function POST(req: Request) {
  try {
    const c = getConfig();
    const { email, locale } = await req.json();
    if (!email || typeof email !== "string") return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    const { store } = storeForLocale(locale);
    const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store },
      body: JSON.stringify({ query: FORGOT_MUTATION, variables: { email: email.trim() } }),
    });
    // Magento may answer with a non-200 status + GraphQL error; surface its message.
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "The store did not respond. Please try again." }, { status: 502 });
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 500 });
  }
}
