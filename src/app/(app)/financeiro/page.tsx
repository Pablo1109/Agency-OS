import { CheckCircle2, CircleDollarSign, Plus, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createFinanceAction, markFinancePaidAction, registerClientPaymentAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDashboardMetrics, getFinanceChart } from "@/lib/metrics";

export default async function FinancePage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const chart = getFinanceChart(data.finances);
  const recurring = data.finances.filter((entry) => entry.recurring);
  const installments = data.finances.filter((entry) => entry.installment);

  return (
    <>
      <PageHeader title="Financeiro" description="Receitas, despesas, assinaturas, parcelamentos e uma leitura simples do lucro real." />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Receitas pagas" value={formatCurrency(metrics.revenue)} detail="Total recebido no mes" icon={CircleDollarSign} tone="teal" />
        <MetricCard title="Despesas pagas" value={formatCurrency(metrics.expenses)} detail="Custos e assinaturas" icon={ReceiptText} tone="gold" />
        <MetricCard title="Lucro real" value={formatCurrency(metrics.profit)} detail="Receitas menos despesas" icon={WalletCards} tone="coral" />
        <MetricCard title="Recorrencias" value={String(recurring.length)} detail={`${installments.length} parcelamento(s) ativo(s)`} icon={Repeat2} tone="slate" />
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
                    <option key={client.id} value={client.id}>{client.company || client.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                <label className="flex items-center gap-2"><input name="paid" type="checkbox" className="h-4 w-4 rounded border" />Pago/recebido</label>
                <label className="flex items-center gap-2"><input name="recurring" type="checkbox" className="h-4 w-4 rounded border" />Recorrente mensal</label>
                <label className="flex items-center gap-2"><input name="installment" type="checkbox" className="h-4 w-4 rounded border" />Parcelado</label>
              </div>
              <Button type="submit"><Plus className="h-4 w-4" />Salvar lancamento</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Receber de cliente</CardTitle>
            <CardDescription>Gera receita paga automaticamente para cliente fixo ou projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={registerClientPaymentAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentClientId">Cliente</Label>
                <Select id="paymentClientId" name="clientId" required defaultValue="">
                  <option value="">Selecione</option>
                  {data.clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.company || client.name} - {formatCurrency(client.monthlyValue)}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Valor recebido</Label>
                  <Input id="paymentAmount" name="amount" type="number" step="0.01" placeholder="Usa valor do cliente" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethodQuick">Metodo</Label>
                  <Input id="paymentMethodQuick" name="paymentMethod" placeholder="Pix" />
                </div>
              </div>
              <Button type="submit"><CheckCircle2 className="h-4 w-4" />Registrar pagamento</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vencimentos dos clientes</CardTitle>
            <CardDescription>Referencia para mensal, quinzenal, semanal ou datas personalizadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.clients.length === 0 ? <p className="text-sm text-muted-foreground">Cadastre clientes para acompanhar vencimentos.</p> : null}
            {data.clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{client.company || client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.billingFrequency.toLowerCase()} | dia(s) {client.dueDays || client.dueDay}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(client.monthlyValue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
            <CardDescription>Clientes fixos, freelances e projetos unicos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.finances.filter((entry) => entry.type === "RECEITA").map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.category} | {formatDate(entry.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                  <Badge className={entry.paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{entry.paid ? "Recebido" : "Pendente"}</Badge>
                  {!entry.paid ? (
                    <form action={markFinancePaidAction} className="mt-2">
                      <input type="hidden" name="entryId" value={entry.id} />
                      <Button type="submit" variant="outline" size="sm">Receber</Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <CardDescription>Assinaturas, equipamentos, freelancers e custos avulsos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.finances.filter((entry) => entry.type === "DESPESA").map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.category} | {entry.dueDate ? formatDate(entry.dueDate) : formatDate(entry.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                  {entry.paid ? <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-emerald-600" /> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
