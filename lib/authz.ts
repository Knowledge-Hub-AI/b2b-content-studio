import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Unauthorized");

  return { session, user };
}

export async function requireAdmin() {
  const { user } = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}
