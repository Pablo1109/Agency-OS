"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ContactRound,
  FileArchive,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { CurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/crm", label: "CRM", icon: ContactRound },
  { href: "/arquivos", label: "Arquivos", icon: FileArchive },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3 }
];

export function AppShell({
  user,
  children
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  async function signOut() {
    if (!user.demo) {
      await authClient.signOut();
    }
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/80 shadow-finance backdrop-blur-xl xl:block">
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center gap-3 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-md">
              AG
            </div>
            <div>
              <p className="text-sm font-semibold tracking-normal">Agency OS</p>
              <p className="text-xs text-muted-foreground">Caixa, clientes e operacao</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground",
                    active && "bg-primary text-primary-foreground shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/70 p-4">
            <div className="mb-3 rounded-lg border border-white/70 bg-secondary/50 p-3">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Settings className="h-4 w-4" />
                Ajustes
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                {user.demo ? "Entrar" : "Sair"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-white/80 px-4 backdrop-blur-xl xl:hidden">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-semibold">Agency OS</p>
              <p className="text-xs text-muted-foreground">mobile</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 pb-24 sm:px-6 lg:px-8 xl:pb-7">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/70 bg-white/90 shadow-finance backdrop-blur-xl xl:hidden">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-muted-foreground",
                  active && "bg-secondary/50 text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
