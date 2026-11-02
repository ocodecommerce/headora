import { storeForLocale } from "../../../../lib/magento.js";
import { cartCookie, readCookie } from "../../../../lib/cart.js";
import { REVOKE_TOKEN_MUTATION } from "../../../../graphql/account.js";
import { TOKEN_COOKIE, clearSessionCookies, customerGql } from "../../../../lib/customer.js";

// Sign out: revoke the token in Magento (best effort), then drop the session + cart cookies.
export async function POST(req: Request) {
  const token = readCookie(req, TOKEN_COOKIE);
  const body = await req.json().catch(() => ({}));
  if (token) await customerGql(token, storeForLocale(typeof body.locale === "string" ? body.locale : undefined).store, REVOKE_TOKEN_MUTATION).catch(() => null);
  const out = Response.json({ ok: true });
  for (const ck of clearSessionCookies(req)) out.headers.append("Set-Cookie", ck);
  // The cookie points at the customer's cart now; a guest can't use it.
  out.headers.append("Set-Cookie", cartCookie(req, null));
  return out;
}
