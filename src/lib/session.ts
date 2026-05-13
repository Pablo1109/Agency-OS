import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type CurrentUser = {
  name: string;
  email: string;
  image?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    redirect("/login");
  }

  try {
    const { auth } = await import("./auth");
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (session?.user) {
      return {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      };
    }
  } catch {
    // Se auth/banco falhar, volta para login.
  }

  redirect("/login");
}
