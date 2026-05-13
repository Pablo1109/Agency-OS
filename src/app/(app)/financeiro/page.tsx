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
import type { FinancialEntry } from "@/lib/types";

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

function entryMonth(entry: FinancialEntry) {
  return monthKey(new Date(entry.dueDate ?? entry.date));
}

function sum(entries: FinancialEntry[], type: "RECEITA" | "DESPESA", paidOnly = false) {
  return entries
    .filter((entry) => entry.type === type && (!paidOnly || entry.paid))
    .reduce((total, entry) => total + entry.amount, 0);
}

function balance(entries: FinancialEntry[], paidOnly = false) {
  return sum(entries, "RECEITA", paidOnly) - sum(entries, "DESPESA", paidOnly);
}

export default async function FinancePage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const chart = getFinanceChart(data.finances);
  const recurring = data.finances.filter((entry) => entry.recurring);
  const installments = data.finances.filter((entry) => entry.installment);
  const selectedDate = parseMonth(params?.month);
  const selectedMonth = monthKey(selectedDate);
  const previousDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  const selectedEntries = data.finances.filter((entry) => entryMonth(entry) === selectedMonth);
  const nextEntries = data.finances.filter((entry) => entryMonth(entry) === monthKey(nextDate));
  const selectedLabel = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const nextLabel = nextDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, parcelamentos, previsao e leitura simples do lucro real."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Receitas pagas" value={formatCurrency(metrics.revenue)} detail="Total recebido no mes" icon={CircleDollarSign} tone="teal" />
        <MetricCard title="Despesas pagas" value={formatCurrency(metrics.expenses)} detail="Custos e assinaturas" icon={ReceiptText} tone="gold" />
        <MetricCard title="Lucro real" value={formatCurrency(metrics.profit)} detail="Receitas menos despesas" icon={WalletCards} tone="coral" />
        <MetricCard title="Recorrencias" value={String(recurring.length)} detail={`${installments.length} parcela(s) ativa(s)`} icon={Repeat2} tone="slate" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Periodo</CardTitle>
            <CardDescription>Consulte meses anteriores, atuais ou futuros.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form action="/financeiro" className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input type="month" name="month" defaultValue={selectedMonth} />
              <Button type="submit" variant="outline">Filtrar</Button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro?month=${monthKey(previousDate)}`}>Mes anterior</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro?month=${monthKey(nextDate)}`}>Proximo mes</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsao de balanco</CardTitle>
            <CardDescription>Realizado e previsto por vencimento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Realizado em {selectedLabel}</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(balance(selectedEntries, true))}</p>
              <p className="mt-2 text-xs text-muted-foreground">Previsto: {formatCurrency(balance(selectedEntries))}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Previsao de {nextLabel}</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(balance(nextEntries))}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Receitas {formatCurrency(sum(nextEntries, "RECEITA"))} | Despesas {formatCurrency(sum(nextEntries, "DESPESA"))}
              </p>
            </div>
          </CardContent>
        </Card>
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
            <CardDescription>Registre receita, despesa ou compra parcelada.</CardDescription>
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
                  <Label htmlFor="amount">Valor da parcela</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="500" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descricao</Label>
                <Input id="description" name="description" placeholder="Notebook, mensalidade cliente..." required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" placeholder="Equipamento, cliente fixo..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Pagamento</Label>
                  <Input id="paymentMethod" name="paymentMethod" placeholder="Pix, cartao, boleto" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Data inicial</Label>
                  <Input id="date" name="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">1o vencimento</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="installments">Quantidade de parcelas</Label>
                <Input id="installments" name="installments" type="number" min="1" max="120" placeholder="Ex: 6" />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Salvar lancamento
              </Button>
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
              <Button type="submit">
                <CheckCircle2 className="h-4 w-4" />
                Registrar pagamento
              </Button>
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
            <CardTitle>Receitas de {selectedLabel}</CardTitle>
            <CardDescription>Clientes fixos, freelances e projetos unicos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEntries.filter((entry) => entry.type === "RECEITA").map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.category} | {formatDate(entry.dueDate ?? entry.date)}</p>
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
            <CardTitle>Despesas de {selectedLabel}</CardTitle>
            <CardDescription>Compras, assinaturas, equipamentos, freelancers e parcelas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEntries.filter((entry) => entry.type === "DESPESA").map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.category} | {formatDate(entry.dueDate ?? entry.date)}</p>
                  {entry.installment ? (
                    <Badge className="mt-2 border-amber-200 bg-amber-50 text-amber-700">
                      Parcela {entry.currentPart}/{entry.installments}
                    </Badge>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                  {entry.paid ? <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-emerald-600" /> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
