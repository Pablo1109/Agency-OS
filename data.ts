"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage("");

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "Usuario");

    try {
      if (mode === "signup") {
        await authClient.signUp.email({
          email,
          password,
          name
        });
      } else {
        await authClient.signIn.email({
          email,
          password
        });
      }

      window.location.href = "/dashboard";
    } catch {
      setMessage("Nao foi possivel entrar. Confira o banco, o auth e os dados informados.");
      setLoading(false);
    }
  }

  return (
    <main className="surface-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {mode === "login" ? <LockKeyhole className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <CardTitle>{mode === "login" ? "Entrar no painel" : "Criar acesso"}</CardTitle>
          <CardDescription>
            Use email e senha. O login funciona depois que Better Auth e Neon estiverem configurados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submit} className="grid gap-4">
            {mode === "signup" ? (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Seu nome" required />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            {message ? <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              className="font-medium text-primary"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Criar primeiro acesso" : "Ja tenho acesso"}
            </button>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Ver demo
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
