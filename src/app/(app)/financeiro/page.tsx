import { CheckCircle2, CircleDollarSign, HandCoins, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { FinanceChart } from "@/components/finance-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { markFinancePaidAction, registerClientPaymentAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDashboardMetrics, getFinanceChart } from "@/lib/metrics";
import type { FinancialEntry } from "@/lib/types";
import { NewFinanceWizard } from "./new-finance-wizard";

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

function parseDueDays(value: string, fallback: number) {
  const days = value
    .split(/[,\s]+/)
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31);

  return days.length ? Array.from(new Set(days)).sort((a, b) => a - b) : [fallback || 1];
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function expectedPaymentsForMonth(data: Awaited<ReturnType<typeof getAppData>>, monthDate: Date) {
  return data.clients
    .filter((client) => client.status === "ATIVO")
    .flatMap((client) => {
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      return parseDueDays(client.dueDays, client.dueDay).map((day) => {
        const dueDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(day, lastDay));
        const paidEntry = data.finances.find((entry) => {
          const entryDate = new Date(entry.dueDate ?? entry.date);
          return entry.type === "RECEITA" && entry.clientId === client.id && entry.paid && sameDay(entryDate, dueDate);
        });

        return {
          client,
          dueDate,
          paidEntry,
          overdue: !paidEntry && dueDate < new Date()
        };
      });
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
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
  const selectedExpenses = selectedEntries.filter((entry) => entry.type === "DESPESA");
  const selectedRevenues = selectedEntries.filter((entry) => entry.type === "RECEITA");
  const walletBalance = balance(data.finances, true);
  const proLaboreTotal = selectedEntries
    .filter((entry) => entry.type === "DESPESA" && entry.paid && entry.category.toLowerCase().includes("pro-labore"))
    .reduce((total, entry) => total + entry.amount, 0);
  const selectedLabel = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const nextLabel = nextDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const expectedClientPayments = expectedPaymentsForMonth(data, selectedDate);
  const nextExpectedClientPayments = expectedPaymentsForMonth(data, nextDate);
  const selectedExpectedReceivables = expectedClientPayments
    .filter((payment) => !payment.paidEntry)
    .reduce((total, payment) => total + payment.client.monthlyValue, 0);
  const nextExpectedReceivables = nextExpectedClientPayments
    .filter((payment) => !payment.paidEntry)
    .reduce((total, payment) => total + payment.client.monthlyValue, 0);
  const selectedForecast = balance(selectedEntries) + selectedExpectedReceivables;
  const nextForecast = balance(nextEntries) + nextExpectedReceivables;

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, parcelamentos, previsoes e confirmacoes rapidas."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Receitas pagas" value={formatCurrency(metrics.revenue)} detail="Total recebido no mes" icon={CircleDollarSign} tone="teal" />
        <MetricCard title="Despesas pagas" value={formatCurrency(metrics.expenses)} detail="Custos e assinaturas" icon={ReceiptText} tone="gold" href={`/financeiro/despesas?month=${selectedMonth}`} />
        <MetricCard title="Lucro real" value={formatCurrency(metrics.profit)} detail="Receitas menos despesas" icon={WalletCards} tone="coral" />
        <MetricCard title="Carteira" value={formatCurrency(walletBalance)} detail="Caixa acumulado" icon={HandCoins} tone="teal" />
        <MetricCard title="Recorrencias" value={String(recurring.length)} detail={`${installments.length} parcela(s) ativa(s)`} icon={Repeat2} tone="slate" href="/financeiro/recorrencias" />
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
              <p className="mt-2 text-xs text-muted-foreground">
                Previsto: {formatCurrency(selectedForecast)} incluindo {formatCurrency(selectedExpectedReceivables)} em clientes fixos
              </p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Previsao de {nextLabel}</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(nextForecast)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Receitas {formatCurrency(sum(nextEntries, "RECEITA") + nextExpectedReceivables)} | Despesas {formatCurrency(sum(nextEntries, "DESPESA"))}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.85fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Carteira da agencia</CardTitle>
            <CardDescription>Saldo acumulado considerando apenas entradas e saidas pagas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Saldo em caixa</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(walletBalance)}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Pro-labore em {selectedLabel}</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(proLaboreTotal)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro-labore</CardTitle>
            <CardDescription>Retiradas para sua pessoa fisica ficam em uma tela separada.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-semibold">{formatCurrency(proLaboreTotal)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Retirado em {selectedLabel}</p>
            </div>
            <Button asChild>
              <a href={`/financeiro/pro-labore?month=${selectedMonth}`}>
                <HandCoins className="h-4 w-4" />
                Abrir pro-labore
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recebimentos previstos</CardTitle>
            <CardDescription>Clientes fixos do periodo selecionado. Confirme quando o pagamento cair.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expectedClientPayments.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente ativo com vencimento previsto.</p> : null}
            {expectedClientPayments.map(({ client, dueDate, paidEntry, overdue }) => (
              <div key={`${client.id}-${dueDate.toISOString()}`} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{client.company || client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence {formatDate(dueDate.toISOString())} | {formatCurrency(client.monthlyValue)}
                  </p>
                  <div className="mt-2">
                    {paidEntry ? (
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Recebido</Badge>
                    ) : overdue ? (
                      <Badge className="border-rose-200 bg-rose-50 text-rose-700">Atrasado</Badge>
                    ) : (
                      <Badge className="border-amber-200 bg-amber-50 text-amber-700">Previsto</Badge>
                    )}
                  </div>
                </div>
                {!paidEntry ? (
                  <form action={registerClientPaymentAction}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="amount" value={client.monthlyValue} />
                    <input type="hidden" name="dueDate" value={dueDate.toISOString().slice(0, 10)} />
                    <input type="hidden" name="date" value={new Date().toISOString().slice(0, 10)} />
                    <input type="hidden" name="description" value={`Pagamento ${client.company || client.name}`} />
                    <Button type="submit" size="sm" variant="outline">
                      <CheckCircle2 className="h-4 w-4" />
                      Recebi
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo lancamento</CardTitle>
            <CardDescription>Escolha receita ou despesa e preencha apenas o que importa.</CardDescription>
          </CardHeader>
          <CardContent>
            <NewFinanceWizard clients={data.clients.map((client) => ({
              id: client.id,
              name: client.name,
              company: client.company,
              monthlyValue: client.monthlyValue,
              plan: client.plan
            }))} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo financeiro</CardTitle>
            <CardDescription>Baseado em lancamentos pagos.</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceChart data={chart} />
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
            {selectedRevenues.map((entry) => (
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

        <Card id="despesas">
          <CardHeader>
            <CardTitle>Despesas de {selectedLabel}</CardTitle>
            <CardDescription>
              {selectedExpenses.length} lancamento(s), total previsto {formatCurrency(sum(selectedEntries, "DESPESA"))} e pago {formatCurrency(sum(selectedEntries, "DESPESA", true))}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedExpenses.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma despesa neste periodo.</p> : null}
            {selectedExpenses.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.category} | {formatDate(entry.dueDate ?? entry.date)}</p>
                  {entry.installment ? (
                    <Badge className="mt-2 border-amber-200 bg-amber-50 text-amber-700">
                      Parcela {entry.currentPart}/{entry.installments}
                    </Badge>
                  ) : null}
                  {entry.recurring ? (
                    <Button asChild variant="ghost" size="sm" className="mt-2 h-8 px-2">
                      <a href="/financeiro/recorrencias">
                        <Repeat2 className="h-4 w-4" />
                        Editar recorrencia
                      </a>
                    </Button>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                  {entry.paid ? <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-emerald-600" /> : null}
                  {!entry.paid ? (
                    <form action={markFinancePaidAction} className="mt-2">
                      <input type="hidden" name="entryId" value={entry.id} />
                      <Button type="submit" variant="outline" size="sm">Paguei</Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
