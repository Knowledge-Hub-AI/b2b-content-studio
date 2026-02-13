import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user } = await requireUser();
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const { id } = await context.params;

  const body = (await req.json()) as Partial<{
    name: string;
    assetType: string;
    systemPrompt: string;
    isActive: boolean;
  }>;

  const updated = await prisma.template.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.assetType !== undefined ? { assetType: body.assetType } : {}),
      ...(body.systemPrompt !== undefined ? { systemPrompt: body.systemPrompt } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
    select: {
      id: true,
      name: true,
      assetType: true,
      systemPrompt: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return Response.json(updated);
}
