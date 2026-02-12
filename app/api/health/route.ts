export async function GET() {
  return Response.json({ ok: true, where: "root /app", ts: new Date().toISOString() });
}
