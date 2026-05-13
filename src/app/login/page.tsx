import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-md">
            AG
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">Agency OS</h1>
          <p className="mt-2 text-sm text-muted-foreground">Controle financeiro e operacional da sua agencia.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
