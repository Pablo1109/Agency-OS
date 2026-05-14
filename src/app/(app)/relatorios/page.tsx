import { BarChart3, CalendarDays, ListChecks, Target, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAppData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { getDashboardMetrics } from "@/lib/metrics";

export default async function ReportsPage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const goal = 8000;
  const goalProgress = (metrics.revenue / goal) * 100;
  const finishedTasks = data.tasks.filter((task) => task.status === "FINALIZADO").length;
  const taskProgress = data.tasks.length ? (finishedTasks / data.tasks.length) * 100 : 0;
  const activeClientProgress = Math.min(100, metrics.activeClients * 20);
  const scheduledContent = data.content.filter((item) => item.status === "AGENDADO" || item.status === "PUBLICADO").length;

  return (
    <>
      <PageHeader
        title="Relatorios"
        description="Indicadores simples para entender crescimento, lucro, operacao e consistencia de conteudo."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Meta do mes"
          value={`${Math.round(goalProgress)}%`}
          detail={`${formatCurrency(metrics.revenue)} de ${formatCurrency(goal)}`}
          icon={Target}
          tone="teal"
        />
        <MetricCard
          title="Lucro real"
          value={formatCurrency(metrics.profit)}
          detail="Depois de despesas pagas"
          icon={WalletCards}
          tone="coral"
        />
        <MetricCard
          title="Tarefas abertas"
          value={String(metrics.pendingTasks)}
          detail="Carga operacional atual"
          icon={ListChecks}
          tone="gold"
        />
        <MetricCard
          title="Conteudos no calendario"
          value={String(data.content.length)}
          detail={`${scheduledContent} agendado(s) ou publicado(s)`}
          icon={CalendarDays}
          tone="slate"
        />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Saude do mes
          </CardTitle>
          <CardDescription>Uma leitura rapida para decidir o que atacar primeiro.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Meta de faturamento</span>
              <strong>{Math.round(goalProgress)}%</strong>
            </div>
            <Progress value={goalProgress} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Clientes ativos</span>
              <strong>{metrics.activeClients}</strong>
            </div>
            <Progress value={activeClientProgress} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Tarefas resolvidas</span>
              <strong>{finishedTasks}</strong>
            </div>
            <Progress value={taskProgress} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
