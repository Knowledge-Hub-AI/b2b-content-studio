import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as { title: string; assetType: string; brief: any };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return new Response("User not found", { status: 401 });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: body.title || "Untitled",
      assetType: body.assetType,
      brief: body.brief ?? {},
    },
    select: { id: true },
  });

  return Response.json(project);
}
