export async function POST() {
  const out = Response.json({ ok: true });
  out.headers.append("Set-Cookie", `headora_customer_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return out;
}
