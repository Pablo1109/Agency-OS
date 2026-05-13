import { ArrowLeft, HandCoins, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createProLaboreAction, deleteFinanceEntryAction } from "@/lib/actions";
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

function isProLabore(entry: FinancialEntry) {
  return entry.type === "DESPESA" && entry.category.toLowerCase().includes("pro-labore");
}

export default async function ProLaborePage({
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
  const withdrawals = data.finances
    .filter((entry) => isProLabore(entry) && entryMonth(entry) === selectedMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const total = withdrawals.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <>
      <PageHeader
        title="Pro-labore"
        description="Registre e acompanhe retiradas da empresa para sua pessoa fisica."
      />

      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <a href="/financeiro">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao financeiro
          </a>
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova retirada</CardTitle>
            <CardDescription>Essa saida reduz o caixa da agencia.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProLaboreAction} className="grid gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="amount">Valor</label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="1500" required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="date">Data</label>
                  <Input id="date" name="date" type="date" />
                </div>
              </div>
              <Input name="paymentMethod" placeholder="Pix, transferencia..." />
              <Input name="description" placeholder="Descricao opcional" />
              <Button type="submit">
                <HandCoins className="h-4 w-4" />
                Registrar retirada
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Filtro mensal para acompanhar suas retiradas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Retirado em {selectedLabel}</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
            </div>
            <form action="/financeiro/pro-labore" className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input type="month" name="month" defaultValue={selectedMonth} />
              <Button type="submit" variant="outline">Filtrar</Button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro/pro-labore?month=${monthKey(previousDate)}`}>Mes anterior</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`/financeiro/pro-labore?month=${monthKey(nextDate)}`}>Proximo mes</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-3">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Nenhuma retirada neste periodo.</CardContent>
          </Card>
        ) : null}

        {withdrawals.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{entry.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(entry.date)} | {entry.paymentMethod ?? "Sem metodo"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
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
