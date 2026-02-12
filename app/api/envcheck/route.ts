export const runtime = "nodejs";

export async function GET() {
  const has = (k: string) => Boolean(process.env[k] && process.env[k]!.length > 0);

  return Response.json({
    ok: true,
    AUTH_SECRET: has("AUTH_SECRET"),
    AUTH_URL: has("AUTH_URL"),
    AUTH_TRUST_HOST: has("AUTH_TRUST_HOST"),
    AUTH_GOOGLE_ID: has("AUTH_GOOGLE_ID"),
    AUTH_GOOGLE_SECRET: has("AUTH_GOOGLE_SECRET"),
    DATABASE_URL: has("DATABASE_URL"),
  });
}
