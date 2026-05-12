import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";
import { formatDate } from "@/lib/format";

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

export default async function CalendarPage() {
  const data = await getAppData();

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Primeira versao do calendario de conteudo por cliente. A edicao completa entra na Fase 2."
      />

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Itens de conteudo no radar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                Agendados
              </span>
              <strong>{data.content.filter((item) => item.status === "AGENDADO").length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4 text-amber-600" />
                Em aprovacao
              </span>
              <strong>{data.content.filter((item) => item.status === "APROVACAO").length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Publicados
              </span>
              <strong>{data.content.filter((item) => item.published).length}</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proximas postagens</CardTitle>
            <CardDescription>Organize tema, aprovacao e publicacao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.content.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-md border p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-semibold">{formatDate(item.publishDate)}</p>
                  <p className="text-xs text-muted-foreground">{item.clientName}</p>
                </div>
                <p className="text-sm font-medium">{item.theme}</p>
                <Badge className={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
