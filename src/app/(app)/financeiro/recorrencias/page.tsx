import { ArrowLeft, CreditCard, Repeat2, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deleteFinanceEntryAction, updateRecurringFinanceAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FinancialEntry } from "@/lib/types";

function dateValue(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function installmentName(description: string) {
  return description.replace(/\s*\(\d+\/\d+\)\s*$/, "");
}

function groupInstallments(entries: FinancialEntry[]) {
  const groups = new Map<string, FinancialEntry[]>();

  entries.forEach((entry) => {
    const key = `${installmentName(entry.description)}|${entry.category}|${entry.amount}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });

  return Array.from(groups.values()).map((items) =>
    items.sort((a, b) => (a.currentPart ?? 0) - (b.currentPart ?? 0))
  );
}

export default async function RecurrencesPage() {
  const data = await getAppData();
  const recurrences = data.finances
    .filter((entry) => entry.type === "DESPESA" && entry.recurring)
    .sort((a, b) => new Date(a.dueDate ?? a.date).getTime() - new Date(b.dueDate ?? b.date).getTime());
  const installmentGroups = groupInstallments(
    data.finances.filter((entry) => entry.type === "DESPESA" && entry.installment)
  );
  const hasItems = recurrences.length > 0 || installmentGroups.length > 0;

  return (
    <>
      <PageHeader
        title="Recorrencias"
        description="Edite despesas fixas e acompanhe parcelas que ainda entram na previsao do financeiro."
      />

      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <a href="/financeiro">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao financeiro
          </a>
        </Button>
      </div>

      <section className="grid gap-4">
        {!hasItems ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhuma despesa recorrente ou parcelada cadastrada ainda.
            </CardContent>
          </Card>
        ) : null}

        {recurrences.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {entry.installment ? <CreditCard className="h-5 w-5 text-primary" /> : <Repeat2 className="h-5 w-5 text-primary" />}
                  {entry.description}
                </CardTitle>
                <CardDescription>
                  {entry.category} | vence {formatDate(entry.dueDate ?? entry.date)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={entry.installment ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700"}>
                  {entry.installment ? `Parcela ${entry.currentPart}/${entry.installments}` : "Recorrente"}
                </Badge>
                {entry.paid ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Paga</Badge> : null}
                <span className="text-sm font-semibold">{formatCurrency(entry.amount)}</span>
              </div>
            </CardHeader>
            <CardContent>
              {entry.recurring ? (
                <form action={updateRecurringFinanceAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
                  <input type="hidden" name="entryId" value={entry.id} />
                  <div className="grid gap-2 xl:col-span-2">
                    <label className="text-sm font-medium" htmlFor={`description-${entry.id}`}>Descricao</label>
                    <Input id={`description-${entry.id}`} name="description" defaultValue={entry.description} required />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor={`category-${entry.id}`}>Categoria</label>
                    <Input id={`category-${entry.id}`} name="category" defaultValue={entry.category} required />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor={`amount-${entry.id}`}>Valor</label>
                    <Input id={`amount-${entry.id}`} name="amount" type="number" step="0.01" defaultValue={entry.amount} required />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor={`dueDate-${entry.id}`}>Vencimento</label>
                    <Input id={`dueDate-${entry.id}`} name="dueDate" type="date" defaultValue={dateValue(entry.dueDate ?? entry.date)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor={`frequency-${entry.id}`}>Frequencia</label>
                    <Select id={`frequency-${entry.id}`} name="recurrenceFrequency" defaultValue={entry.recurrenceFrequency ?? "MENSAL"}>
                      <option value="MENSAL">Mensal</option>
                      <option value="QUINZENAL">Quinzenal</option>
                      <option value="SEMANAL">Semanal</option>
                      <option value="PERSONALIZADO">Personalizado</option>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-2 xl:col-span-2">
                    <label className="text-sm font-medium" htmlFor={`paymentMethod-${entry.id}`}>Forma de pagamento</label>
                    <Input id={`paymentMethod-${entry.id}`} name="paymentMethod" defaultValue={entry.paymentMethod ?? ""} placeholder="Pix, cartao, boleto" />
                  </div>
                  <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
                    <input type="checkbox" name="recurring" defaultChecked />
                    Manter ativa
                  </label>
                  <Button type="submit" className="w-fit">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </form>
              ) : (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Esta compra parcelada aparece aqui para acompanhamento ate terminar de pagar.
                </div>
              )}
              <form action={deleteFinanceEntryAction} className="mt-3">
                <input type="hidden" name="entryId" value={entry.id} />
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}

        {installmentGroups.map((group) => {
          const first = group[0];
          const paidCount = group.filter((entry) => entry.paid).length;
          const total = group.reduce((sum, entry) => sum + entry.amount, 0);
          const nextOpen = group.find((entry) => !entry.paid) ?? first;

          return (
            <Card key={`${first.description}-${first.category}-${first.amount}`}>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {installmentName(first.description)}
                  </CardTitle>
                  <CardDescription>
                    {first.category} | proximo vencimento {formatDate(nextOpen.dueDate ?? nextOpen.date)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                    {paidCount}/{group.length} pagas
                  </Badge>
                  <span className="text-sm font-semibold">{formatCurrency(total)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">Valor da parcela</p>
                    <p className="font-semibold">{formatCurrency(first.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelas</p>
                    <p className="font-semibold">{group.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Restante</p>
                    <p className="font-semibold">{formatCurrency(group.filter((entry) => !entry.paid).reduce((sum, entry) => sum + entry.amount, 0))}</p>
                  </div>
                </div>

                <details className="mt-3 rounded-md border p-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-primary">
                    Gerenciar parcelas
                  </summary>
                  <div className="mt-3 grid gap-2">
                    {group.map((entry) => (
                      <div key={entry.id} className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">Parcela {entry.currentPart}/{entry.installments}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence {formatDate(entry.dueDate ?? entry.date)} | {formatCurrency(entry.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.paid ? (
                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Paga</Badge>
                          ) : (
                            <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pendente</Badge>
                          )}
                          <form action={deleteFinanceEntryAction}>
                            <input type="hidden" name="entryId" value={entry.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
