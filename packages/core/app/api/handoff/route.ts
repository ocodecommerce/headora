export async function GET(req: Request) {
  const url = new URL(req.url);
  const masked = url.searchParams.get("masked_quote");
  const base = process.env.MAGENTO_BASE_URL?.replace(/\/$/, "");
  if (!masked || !base) return Response.json({ ok: false }, { status: 400 });
  return Response.redirect(`${base}/headora/handoff?masked_quote=${encodeURIComponent(masked)}`, 302);
}
TSX
echo OK && find packages/core -type f | sort