"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileArchive,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { CurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { href: "/dashboard", label: "Visao Geral", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/arquivos", label: "Arquivos", icon: FileArchive },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3 }
];

const mobileNavigation = navigation.slice(0, 5);

export function AppShell({
  user,
  children
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  async function signOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/85 shadow-finance backdrop-blur-xl xl:block">
        <div className="flex h-full flex-col">
          <div className="px-5 py-6">
            <div className="rounded-xl border border-white/70 bg-gradient-to-br from-primary to-accent p-4 text-primary-foreground shadow-finance">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-sm font-black ring-1 ring-white/25">
                  AG
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-normal">Agency OS</p>
                  <p className="text-xs text-primary-foreground/75">Operacao, caixa e conteudo</p>
                </div>
              </div>
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
                    "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary/70 hover:text-foreground",
                    active && "bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
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
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-white/85 px-4 backdrop-blur-xl xl:hidden">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Menu">
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-semibold">Agency OS</p>
              <p className="text-xs text-muted-foreground">Painel operacional</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 pb-24 sm:px-6 lg:px-8 xl:pb-7">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/70 bg-white/95 shadow-finance backdrop-blur-xl xl:hidden">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground",
                  active && "bg-secondary/60 text-primary"
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
