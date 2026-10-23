import { getConfig, storeForLocale } from "../../../lib/magento.js";

export const revalidate = 0;

const CONTACT_MUTATION = `mutation Contact($input: ContactUsInput!) { contactUs(input: $input) { status } }`;

// POST /api/contact { name, email, telephone?, comment, locale } -> Magento contactUs (Venia contact page).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const input = {
    name: str(body.name, 255),
    email: str(body.email, 254),
    telephone: str(body.telephone, 40),
    comment: str(body.comment, 5000),
  };
  if (!input.name || !input.comment || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return Response.json({ ok: false, error: "Please fill in Name, a valid Email and Message." }, { status: 400 });
  }
  const locale = typeof body.locale === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(body.locale) ? body.locale : undefined;
  try {
    const res = await fetch(getConfig().MAGENTO_GRAPHQL_URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Store: storeForLocale(locale).store },
      body: JSON.stringify({ query: CONTACT_MUTATION, variables: { input } }),
    });
    const json = await res.json().catch(() => null);
    if (!json) return Response.json({ ok: false, error: "The store did not respond." }, { status: 502 });
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 422 });
    return Response.json({ ok: Boolean(json.data?.contactUs?.status) });
  } catch {
    return Response.json({ ok: false, error: "The store did not respond." }, { status: 502 });
  }
}
