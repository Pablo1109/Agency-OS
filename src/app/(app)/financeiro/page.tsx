import { CircleDollarSign, Plus, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { FinanceEntryLists } from "@/components/finance-entry-lists";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createFinanceAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { getDashboardMetrics, getFinanceChart } from "@/lib/metrics";

export default async function FinancePage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const chart = getFinanceChart(data.finances);
  const recurring = data.finances.filter((entry) => entry.recurring);
  const installments = data.finances.filter((entry) => entry.installment);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, assinaturas, parcelamentos e uma leitura simples do lucro real."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Receitas pagas"
          value={formatCurrency(metrics.revenue)}
          detail="Total recebido no mes"
          icon={CircleDollarSign}
          tone="teal"
        />
        <MetricCard
          title="Despesas pagas"
          value={formatCurrency(metrics.expenses)}
          detail="Custos e assinaturas"
          icon={ReceiptText}
          tone="gold"
        />
        <MetricCard
          title="Lucro real"
          value={formatCurrency(metrics.profit)}
          detail="Receitas menos despesas"
          icon={WalletCards}
          tone="coral"
        />
        <MetricCard
          title="Recorrencias"
          value={String(recurring.length)}
          detail={`${installments.length} parcelamento(s) ativo(s)`}
          icon={Repeat2}
          tone="slate"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo financeiro</CardTitle>
            <CardDescription>Baseado em lancamentos pagos.</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceChart data={chart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo lancamento</CardTitle>
            <CardDescription>Registre receita, despesa, assinatura ou parcela.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createFinanceAction} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select id="type" name="type" defaultValue="RECEITA">
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="500" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descricao</Label>
                <Input id="description" name="description" placeholder="Mensalidade cliente X" required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" placeholder="Cliente fixo, assinatura..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Pagamento</Label>
                  <Input id="paymentMethod" name="paymentMethod" placeholder="Pix, cartao, boleto" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Vencimento</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select id="clientId" name="clientId" defaultValue="">
                  <option value="">Sem cliente</option>
                  {data.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company || client.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                <label className="flex items-center gap-2">
                  <input name="paid" type="checkbox" className="h-4 w-4 rounded border" />
                  Pago/recebido
                </label>
                <label className="flex items-center gap-2">
                  <input name="recurring" type="checkbox" className="h-4 w-4 rounded border" />
                  Recorrente mensal
                </label>
                <label className="flex items-center gap-2">
                  <input name="installment" type="checkbox" className="h-4 w-4 rounded border" />
                  Parcelado
                </label>
              </div>
              <PendingSubmitButton idleLabel="Salvar lancamento" pendingLabel="Salvando..." icon={Plus} />
            </form>
          </CardContent>
        </Card>
      </section>

      <FinanceEntryLists initialEntries={data.finances} />
    </>
  );
}
