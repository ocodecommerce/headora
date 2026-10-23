import { getConfig, storeForLocale } from "../../../lib/magento.js";

export const revalidate = 0;

const SUBSCRIBE_MUTATION = `mutation Subscribe($email: String!) { subscribeEmailToNewsletter(email: $email) { status } }`;

// POST /api/newsletter { email, locale } -> Magento newsletter subscription (footer form).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  const locale = typeof body.locale === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(body.locale) ? body.locale : undefined;
  try {
    const res = await fetch(getConfig().MAGENTO_GRAPHQL_URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Store: storeForLocale(locale).store },
      body: JSON.stringify({ query: SUBSCRIBE_MUTATION, variables: { email } }),
    });
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "The store did not respond." }, { status: 502 });
    // Magento's own messages ("This email address is already subscribed.") are user-facing.
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 422 });
    return Response.json({ ok: true, status: json.data?.subscribeEmailToNewsletter?.status ?? null });
  } catch {
    return Response.json({ ok: false, error: "The store did not respond." }, { status: 502 });
  }
}
