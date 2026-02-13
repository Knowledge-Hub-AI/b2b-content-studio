import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "database" },
});
