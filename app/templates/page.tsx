import { auth } from "@/auth";
import TemplatesClient from "./templates-client";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session) {
    return (
      <main style={{ padding: 40 }}>
        <a href="/api/auth/signin">Sign in</a>
      </main>
    );
  }
  return <TemplatesClient />;
}
