import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type CurrentUser = {
  name: string;
  email: string;
  image?: string | null;
  demo: boolean;
};

const demoUser: CurrentUser = {
  name: "Seu Painel",
  email: "modo-demo@agencia.local",
  demo: true
};

export async function getCurrentUser(): Promise<CurrentUser> {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    return demoUser;
  }

  try {
    const { auth } = await import("./auth");
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session && process.env.REQUIRE_AUTH === "true") {
      redirect("/login");
    }

    return session?.user
      ? {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          demo: false
        }
      : demoUser;
  } catch {
    return demoUser;
  }
}
