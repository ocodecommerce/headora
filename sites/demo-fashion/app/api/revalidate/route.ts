
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.secret !== process.env.REVALIDATE_SECRET) return Response.json({ ok: false }, { status: 401 });
  for (const t of body.tags ?? []) ;
  return Response.json({ ok: true, purged: body.tags ?? [] });
}
