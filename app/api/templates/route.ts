import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET() {
  const { user } = await requireUser();

  const templates = await prisma.template.findMany({
    where: user.role === "admin" ? {} : { isActive: true },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      assetType: true,
      systemPrompt: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return Response.json({ templates, isAdmin: user.role === "admin" });
}

export async function POST(req: Request) {
  // admin-only
  const { user } = await requireUser();
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const body = (await req.json()) as {
    name: string;
    assetType: string;
    systemPrompt: string;
    isActive?: boolean;
  };

  if (!body.name?.trim()) return new Response("Missing name", { status: 400 });
  if (!body.assetType?.trim()) return new Response("Missing assetType", { status: 400 });
  if (!body.systemPrompt?.trim()) return new Response("Missing systemPrompt", { status: 400 });

  const created = await prisma.template.create({
    data: {
      name: body.name.trim(),
      assetType: body.assetType.trim(),
      systemPrompt: body.systemPrompt.trim(),
      isActive: body.isActive ?? true,
    },
    select: { id: true },
  });

  return Response.json(created);
}
