import { CART_COOKIE, readCookie } from "../../../lib/cart.js";

// GET /api/handoff[?masked_quote=…] -> Magento native checkout. Without the param, the
// guest cart from the headora_cart cookie is handed off (mini-cart "Checkout" button).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const masked = url.searchParams.get("masked_quote") ?? readCookie(req, CART_COOKIE);
  const base = process.env.MAGENTO_BASE_URL?.replace(/\/$/, "");
  if (!masked || !base) return Response.json({ ok: false }, { status: 400 });
  return Response.redirect(`${base}/headora/handoff?masked_quote=${encodeURIComponent(masked)}`, 302);
}
