import { CircleDollarSign, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadStatusLabels } from "@/lib/constants";
import { getAppData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import type { LeadStatus } from "@/lib/types";

const pipeline: LeadStatus[] = [
  "LEAD_NOVO",
  "CONTATO_FEITO",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "FECHADO",
  "PERDIDO"
];

export default async function CrmPage() {
  const data = await getAppData();

  return (
    <>
      <PageHeader
        title="CRM"
        description="Pipeline simples para acompanhar oportunidades, propostas e negociacoes."
      />

      <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {pipeline.map((status) => (
          <Card key={status} className="min-h-72">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {leadStatusLabels[status]}
                <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                  {data.leads.filter((lead) => lead.status === status).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.leads
                .filter((lead) => lead.status === status)
                .map((lead) => (
                  <div key={lead.id} className="rounded-md border bg-white p-3">
                    <p className="text-sm font-semibold">{lead.company || lead.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{lead.desiredService}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                        {formatCurrency(lead.estimatedBudget)}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
