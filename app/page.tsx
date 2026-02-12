import { auth } from "@/auth";
import Studio from "./studio";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <main style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>B2B Content Studio</h1>
        <p>Please sign in to continue.</p>
        <a href="/api/auth/signin">Sign in with Google</a>
      </main>
    );
  }

  return <Studio userEmail={session.user?.email} />;
}
