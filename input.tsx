import { BarChart3, LineChart, Target, WalletCards } from "lucide-react";
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

  return (
    <>
      <PageHeader
        title="Relatorios"
        description="Indicadores iniciais para entender crescimento, lucro e carga operacional."
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
          icon={BarChart3}
          tone="gold"
        />
        <MetricCard
          title="Leads no CRM"
          value={String(data.leads.length)}
          detail="Pipeline inicial"
          icon={LineChart}
          tone="slate"
        />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saude do mes</CardTitle>
          <CardDescription>Uma leitura simples para decidir o que atacar primeiro.</CardDescription>
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
            <Progress value={Math.min(100, metrics.activeClients * 20)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Tarefas resolvidas</span>
              <strong>{data.tasks.filter((task) => task.status === "FINALIZADO").length}</strong>
            </div>
            <Progress value={(data.tasks.filter((task) => task.status === "FINALIZADO").length / data.tasks.length) * 100} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
