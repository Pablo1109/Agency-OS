import { ArrowLeft, CheckCircle2, CreditCard, Repeat2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteFinanceEntryAction, markFinancePaidAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
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

function sum(entries: FinancialEntry[], paidOnly = false) {
  return entries
    .filter((entry) => !paidOnly || entry.paid)
    .reduce((total, entry) => total + entry.amount, 0);
}

export default async function ExpensesPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const data = await getAppData();
  const selectedDate = parseMonth(params?.month);
  const selectedMonth = monthKey(selectedDate);
  const previousDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  const selectedLabel = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const expenses = data.finances
    .filter((entry) => entry.type === "DESPESA" && entryMonth(entry) === selectedMonth)
    .sort((a, b) => new Date(a.dueDate ?? a.date).getTime() - new Date(b.dueDate ?? b.date).getTime());

  return (
    <>
      <PageHeader
        title="Despesas"
        description="Visualize, filtre, pague ou exclua despesas do periodo."
      />

      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <a href="/financeiro">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao financeiro
          </a>
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
            <CardDescription>Padrao no mes atual, com acesso a meses anteriores e futuros.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form action="/financeiro/despesas" className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input type="month" name="month" defaultValue={selectedMonth} />
              <Button type="submit" variant="outline">Filtrar</Button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro/despesas?month=${monthKey(previousDate)}`}>Mes anterior</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro/despesas?month=${monthKey(nextDate)}`}>Proximo mes</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de {selectedLabel}</CardTitle>
            <CardDescription>{expenses.length} despesa(s) no periodo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Previsto</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(sum(expenses))}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Pago</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(sum(expenses, true))}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(sum(expenses.filter((entry) => !entry.paid)))}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-3">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Nenhuma despesa neste periodo.</CardContent>
          </Card>
        ) : null}

        {expenses.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{entry.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.category} | {formatDate(entry.dueDate ?? entry.date)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.installment ? (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                      <CreditCard className="mr-1 h-3 w-3" />
                      Parcela {entry.currentPart}/{entry.installments}
                    </Badge>
                  ) : null}
                  {entry.recurring ? (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                      <Repeat2 className="mr-1 h-3 w-3" />
                      Recorrente
                    </Badge>
                  ) : null}
                  {entry.paid ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Paga</Badge>
                  ) : (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pendente</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <p className="w-full text-left text-sm font-semibold sm:w-auto sm:text-right">{formatCurrency(entry.amount)}</p>
                {!entry.paid ? (
                  <form action={markFinancePaidAction}>
                    <input type="hidden" name="entryId" value={entry.id} />
                    <Button type="submit" variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Paguei
                    </Button>
                  </form>
                ) : null}
                <form action={deleteFinanceEntryAction}>
                  <input type="hidden" name="entryId" value={entry.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
