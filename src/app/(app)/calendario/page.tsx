import { CalendarDays, CheckCircle2, Clock3, Plus, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createContentItemAction, updateContentItemAction, updateContentStatusAction } from "@/lib/calendar-actions";
import { getAppData } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { ContentItem } from "@/lib/types";

const statusFlow = ["IDEIA", "PRODUCAO", "APROVACAO", "AGENDADO", "PUBLICADO"] as const;

const statusTone = {
  IDEIA: "border-slate-200 bg-slate-100 text-slate-600",
  PRODUCAO: "border-sky-200 bg-sky-50 text-sky-700",
  APROVACAO: "border-amber-200 bg-amber-50 text-amber-700",
  AGENDADO: "border-primary/20 bg-primary/10 text-primary",
  PUBLICADO: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const statusLabel = {
  IDEIA: "Ideia",
  PRODUCAO: "Producao",
  APROVACAO: "Aprovacao",
  AGENDADO: "Agendado",
  PUBLICADO: "Publicado"
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonth(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return new Date();
  }

  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function startOfCalendar(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const day = first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - day);
  return start;
}

function calendarDays(monthDate: Date) {
  const start = startOfCalendar(monthDate);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function sameDay(a: Date | string, b: Date) {
  const left = new Date(a);
  return left.getFullYear() === b.getFullYear() && left.getMonth() === b.getMonth() && left.getDate() === b.getDate();
}

function nextStatus(status: ContentItem["status"]) {
  const current = statusFlow.indexOf(status);
  return statusFlow[Math.min(current + 1, statusFlow.length - 1)];
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string; client?: string }>;
}) {
  const params = await searchParams;
  const data = await getAppData();
  const selectedDate = parseMonth(params?.month);
  const selectedMonth = monthKey(selectedDate);
  const selectedClient = params?.client ?? "all";
  const previousDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  const days = calendarDays(selectedDate);
  const content = data.content.filter((item) => {
    const itemDate = new Date(item.publishDate);
    const inMonth = itemDate.getMonth() === selectedDate.getMonth() && itemDate.getFullYear() === selectedDate.getFullYear();
    const inClient = selectedClient === "all" || item.clientId === selectedClient;
    return inMonth && inClient;
  });
  const monthLabel = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const counters = statusFlow.map((status) => ({
    status,
    total: content.filter((item) => item.status === status).length
  }));

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Planeje, aprove e publique conteudos por cliente em uma visao mensal."
        action={
          <Button asChild variant="outline">
            <a href="#nova-postagem">
              <Plus className="h-4 w-4" />
              Nova postagem
            </a>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Periodo e filtros</CardTitle>
              <CardDescription>Troque o mes ou acompanhe um cliente especifico.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form action="/calendario" className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="month">Mes</Label>
                  <Input id="month" type="month" name="month" defaultValue={selectedMonth} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select id="client" name="client" defaultValue={selectedClient}>
                    <option value="all">Todos os clientes</option>
                    {data.clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company || client.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit" variant="outline">
                  Filtrar calendario
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="ghost" size="sm">
                  <a href={`/calendario?month=${monthKey(previousDate)}&client=${selectedClient}`}>Mes anterior</a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={`/calendario?month=${monthKey(nextDate)}&client=${selectedClient}`}>Proximo mes</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de {monthLabel}</CardTitle>
              <CardDescription>Status do fluxo de conteudo.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {counters.map(({ status, total }) => (
                <div key={status} className="flex items-center justify-between rounded-md border bg-white/80 p-3">
                  <Badge className={statusTone[status]}>{statusLabel[status]}</Badge>
                  <strong>{total}</strong>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card id="nova-postagem">
            <CardHeader>
              <CardTitle>Nova postagem</CardTitle>
              <CardDescription>Cadastre tema, legenda, data e cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createContentItemAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select id="clientId" name="clientId" required>
                    <option value="">Selecione</option>
                    {data.clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company || client.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publishDate">Data</Label>
                  <Input id="publishDate" name="publishDate" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Input id="theme" name="theme" placeholder="Ex: prova social, bastidores, oferta" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="caption">Legenda</Label>
                  <Textarea id="caption" name="caption" placeholder="Texto, gancho ou briefing da postagem" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue="IDEIA">
                    {statusFlow.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Criar postagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {monthLabel}
                </CardTitle>
                <CardDescription>Grade mensal com os conteudos do periodo.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayItems = content.filter((item) => sameDay(item.publishDate, day));
                  const outside = day.getMonth() !== selectedDate.getMonth();
                  const today = sameDay(new Date(), day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={[
                        "min-h-28 rounded-lg border bg-white/80 p-2 text-left",
                        outside ? "opacity-40" : "",
                        today ? "ring-2 ring-primary/40" : ""
                      ].join(" ")}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold">{day.getDate()}</span>
                        {today ? <span className="text-[10px] font-semibold text-primary">Hoje</span> : null}
                      </div>
                      <div className="space-y-1">
                        {dayItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="rounded-md border bg-secondary/40 px-2 py-1">
                            <p className="truncate text-[11px] font-semibold">{item.theme}</p>
                            <p className="truncate text-[10px] text-muted-foreground">{item.clientName}</p>
                          </div>
                        ))}
                        {dayItems.length > 3 ? (
                          <p className="text-[10px] text-muted-foreground">+{dayItems.length - 3} conteudo(s)</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fila de conteudo</CardTitle>
              <CardDescription>Edite dados e avance status sem sair da tela.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma postagem cadastrada neste filtro.
                </p>
              ) : null}

              {content.map((item) => {
                const next = nextStatus(item.status);
                return (
                  <details key={item.id} className="rounded-lg border bg-white/80 p-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.theme}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.clientName} | {formatDate(item.publishDate)}
                        </p>
                      </div>
                      <Badge className={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
                    </summary>

                    <div className="mt-4 grid gap-4">
                      <form action={updateContentItemAction} className="grid gap-3">
                        <input type="hidden" name="contentId" value={item.id} />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Select name="clientId" defaultValue={item.clientId}>
                            {data.clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.company || client.name}
                              </option>
                            ))}
                          </Select>
                          <Input name="publishDate" type="date" defaultValue={item.publishDate.slice(0, 10)} />
                        </div>
                        <Input name="theme" defaultValue={item.theme} />
                        <Select name="status" defaultValue={item.status}>
                          {statusFlow.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel[status]}
                            </option>
                          ))}
                        </Select>
                        <Button type="submit" variant="outline" size="sm" className="w-fit">
                          <Sparkles className="h-4 w-4" />
                          Salvar ajustes
                        </Button>
                      </form>

                      {item.status !== "PUBLICADO" ? (
                        <form action={updateContentStatusAction}>
                          <input type="hidden" name="contentId" value={item.id} />
                          <input type="hidden" name="status" value={next} />
                          <Button type="submit" size="sm">
                            <Send className="h-4 w-4" />
                            Avancar para {statusLabel[next]}
                          </Button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Publicado
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
