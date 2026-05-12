import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
import { clientStatusTone, taskPriorityLabels, taskPriorityTone } from "@/lib/constants";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { getAppData } from "@/lib/data";
import { getDashboardMetrics, getFinanceChart } from "@/lib/metrics";

export default async function DashboardPage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const chart = getFinanceChart(data.finances);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visao rapida da operacao, dinheiro entrando, gastos e pendencias que precisam de atencao."
      />

      {!process.env.DATABASE_URL ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo demonstracao ativo. Depois de conectar o Neon, os cadastros passam a salvar no banco.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Faturamento do mes"
          value={formatCurrency(metrics.revenue)}
          detail={`${metrics.pendingPayments.length} recebimento(s) pendente(s)`}
          icon={TrendingUp}
          tone="teal"
        />
        <MetricCard
          title="Lucro real do mes"
          value={formatCurrency(metrics.profit)}
          detail="Receitas pagas menos gastos pagos"
          icon={WalletCards}
          tone="coral"
        />
        <MetricCard
          title="Gastos do mes"
          value={formatCurrency(metrics.expenses)}
          detail={`${metrics.pendingBills.length} conta(s) em aberto`}
          icon={TrendingDown}
          tone="gold"
        />
        <MetricCard
          title="Clientes ativos"
          value={String(metrics.activeClients)}
          detail={`${metrics.overdueClients.length} cliente(s) inadimplente(s)`}
          icon={UsersRound}
          tone="slate"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Financeiro dos ultimos meses</CardTitle>
              <CardDescription>Receita, despesa e lucro com base no que ja foi pago.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FinanceChart data={chart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda do dia</CardTitle>
            <CardDescription>Conteudos e vencimentos mais proximos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.upcomingContent.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-md border p-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{item.theme}</p>
                    <span className="text-xs text-muted-foreground">{formatRelativeDay(item.publishDate)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.clientName}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas urgentes</CardTitle>
            <CardDescription>{metrics.pendingTasks} tarefa(s) ainda abertas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.urgentTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  <Badge className={taskPriorityTone[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.clientName}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Prazo: {task.dueDate ? formatRelativeDay(task.dueDate) : "Sem prazo"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos pendentes</CardTitle>
            <CardDescription>Receitas ainda sem baixa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.pendingPayments.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riscos rapidos</CardTitle>
            <CardDescription>Coisas que podem travar sua rotina.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.overdueClients.map((client) => (
              <div key={client.id} className="flex items-center gap-3 rounded-md border p-3">
                <AlertCircle className="h-4 w-4 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.company || client.name}</p>
                  <Badge className={clientStatusTone[client.status]}>Pagamento atrasado</Badge>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Clock3 className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Revise tarefas aguardando cliente antes do fim do dia.</p>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Mantenha entregas combinadas registradas por cliente.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
