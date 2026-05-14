import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  TrendingDown,
  TrendingUp,
  UsersRound,
  WalletCards
} from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientStatusTone, taskPriorityLabels, taskPriorityTone, taskStatusLabels } from "@/lib/constants";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { getAppData } from "@/lib/data";
import { getDashboardMetrics, getFinanceChart } from "@/lib/metrics";

function paidBalance(finances: Awaited<ReturnType<typeof getAppData>>["finances"]) {
  return finances
    .filter((entry) => entry.paid)
    .reduce((total, entry) => total + (entry.type === "RECEITA" ? entry.amount : -entry.amount), 0);
}

export default async function DashboardPage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const chart = getFinanceChart(data.finances);
  const todayTasks = data.tasks
    .filter((task) => task.status !== "FINALIZADO")
    .filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString());
  const inProgressTasks = data.tasks.filter((task) => task.status === "EM_ANDAMENTO");
  const walletBalance = paidBalance(data.finances);

  return (
    <>
      <PageHeader
        title="Visao Geral"
        description="Seu painel de comando: dinheiro, tarefas, agenda e alertas do que precisa de atencao hoje."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Faturamento do mes"
          value={formatCurrency(metrics.revenue)}
          detail={`${metrics.pendingPayments.length} recebimento(s) pendente(s)`}
          icon={TrendingUp}
          tone="teal"
          href="/financeiro"
        />
        <MetricCard
          title="Lucro real"
          value={formatCurrency(metrics.profit)}
          detail="Receitas pagas menos despesas pagas"
          icon={WalletCards}
          tone="coral"
          href="/financeiro"
        />
        <MetricCard
          title="Gastos do mes"
          value={formatCurrency(metrics.expenses)}
          detail={`${metrics.pendingBills.length} conta(s) em aberto`}
          icon={TrendingDown}
          tone="gold"
          href="/financeiro"
        />
        <MetricCard
          title="Caixa atual"
          value={formatCurrency(walletBalance)}
          detail={`${metrics.activeClients} cliente(s) ativo(s)`}
          icon={UsersRound}
          tone="slate"
          href="/clientes"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Agenda de hoje
            </CardTitle>
            <CardDescription>Conteudos e prazos que entram no radar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.upcomingContent.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border bg-white/80 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">{item.theme}</p>
                  <span className="text-xs text-muted-foreground">{formatRelativeDay(item.publishDate)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.clientName}</p>
              </div>
            ))}
            {metrics.upcomingContent.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Nenhuma postagem proxima cadastrada.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Prioridades da operacao
            </CardTitle>
            <CardDescription>Tarefas urgentes, em andamento e vencendo hoje.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-secondary/35 p-4">
              <p className="text-sm text-muted-foreground">Para hoje</p>
              <p className="mt-1 text-2xl font-semibold">{todayTasks.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">tarefas com prazo hoje</p>
            </div>
            <div className="rounded-lg border bg-secondary/35 p-4">
              <p className="text-sm text-muted-foreground">Em andamento</p>
              <p className="mt-1 text-2xl font-semibold">{inProgressTasks.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">jobs sendo produzidos</p>
            </div>
            <div className="space-y-3 md:col-span-2">
              {metrics.urgentTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-md border bg-white/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.clientName ?? "Sem cliente"} | {taskStatusLabels[task.status]}
                      </p>
                    </div>
                    <Badge className={taskPriorityTone[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
                  </div>
                </div>
              ))}
              {metrics.urgentTasks.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma tarefa urgente aberta.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Recebimentos
            </CardTitle>
            <CardDescription>O que ainda precisa cair no caixa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.pendingPayments.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border bg-white/80 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.clientName ?? entry.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.dueDate ? formatRelativeDay(entry.dueDate) : "Sem venc."}
                  </p>
                </div>
              </div>
            ))}
            {metrics.pendingPayments.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Nenhum recebimento pendente.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Fluxo financeiro</CardTitle>
              <CardDescription>Receita e lucro com base nos lancamentos pagos.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FinanceChart data={chart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riscos rapidos</CardTitle>
            <CardDescription>Coisas que podem travar sua rotina.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.overdueClients.map((client) => (
              <div key={client.id} className="flex items-center gap-3 rounded-md border bg-white/80 p-3">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{client.company || client.name}</p>
                  <Badge className={clientStatusTone[client.status]}>Pagamento atrasado</Badge>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-md border bg-white/80 p-3">
              <Clock3 className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Revise tarefas aguardando cliente antes do fim do dia.</p>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-white/80 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Atualize recebimentos assim que cairem no caixa.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
