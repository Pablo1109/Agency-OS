"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { deleteFinanceAction, updateFinancePaidAction } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FinancialEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PendingAction = "paid" | "delete";

function financeFormData(entry: FinancialEntry, paid?: boolean) {
  const formData = new FormData();
  formData.set("financeId", entry.id);

  if (typeof paid === "boolean") {
    formData.set("paid", String(paid));
  }

  return formData;
}

function EntryActions({
  entry,
  pendingAction,
  onTogglePaid,
  onDelete
}: {
  entry: FinancialEntry;
  pendingAction?: PendingAction;
  onTogglePaid: (entry: FinancialEntry) => void;
  onDelete: (entry: FinancialEntry) => void;
}) {
  const disabled = Boolean(pendingAction);
  const paidLabel = entry.paid
    ? "Marcar pendente"
    : entry.type === "RECEITA"
      ? "Marcar recebido"
      : "Marcar pago";

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onTogglePaid(entry)}>
        {pendingAction === "paid" ? "Atualizando..." : paidLabel}
      </Button>
      <Button type="button" variant="destructive" size="sm" disabled={disabled} onClick={() => onDelete(entry)}>
        <Trash2 className="h-4 w-4" />
        {pendingAction === "delete" ? "Excluindo..." : "Excluir"}
      </Button>
    </div>
  );
}

function EntryCard({
  entry,
  pendingAction,
  onTogglePaid,
  onDelete
}: {
  entry: FinancialEntry;
  pendingAction?: PendingAction;
  onTogglePaid: (entry: FinancialEntry) => void;
  onDelete: (entry: FinancialEntry) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{entry.description}</p>
        <p className="text-xs text-muted-foreground">
          {entry.category} | {entry.dueDate ? formatDate(entry.dueDate) : formatDate(entry.date)}
        </p>
        {entry.type === "DESPESA" ? (
          <div className="mt-1 flex gap-2">
            {entry.recurring ? <Badge className="border-sky-200 bg-sky-50 text-sky-700">Recorrente</Badge> : null}
            {entry.installment ? (
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                Parcela {entry.currentPart}/{entry.installments}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-2 text-right">
        <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
        {entry.type === "RECEITA" ? (
          <Badge className={entry.paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
            {entry.paid ? "Recebido" : "Pendente"}
          </Badge>
        ) : entry.paid ? (
          <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-emerald-600" />
        ) : null}
        <EntryActions entry={entry} pendingAction={pendingAction} onTogglePaid={onTogglePaid} onDelete={onDelete} />
      </div>
    </div>
  );
}

export function FinanceEntryLists({ initialEntries }: { initialEntries: FinancialEntry[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);
  const [pendingActions, setPendingActions] = useState<Record<string, PendingAction>>({});

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  function setPending(entryId: string, action?: PendingAction) {
    setPendingActions((current) => {
      const next = { ...current };

      if (action) {
        next[entryId] = action;
      } else {
        delete next[entryId];
      }

      return next;
    });
  }

  function togglePaid(entry: FinancialEntry) {
    const previousEntries = entries;
    const nextPaid = !entry.paid;

    setEntries((current) => current.map((item) => (item.id === entry.id ? { ...item, paid: nextPaid } : item)));
    setPending(entry.id, "paid");

    startTransition(async () => {
      try {
        await updateFinancePaidAction(financeFormData(entry, nextPaid));
        router.refresh();
      } catch {
        setEntries(previousEntries);
      } finally {
        setPending(entry.id);
      }
    });
  }

  function deleteEntry(entry: FinancialEntry) {
    const previousEntries = entries;

    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setPending(entry.id, "delete");

    startTransition(async () => {
      try {
        await deleteFinanceAction(financeFormData(entry));
        router.refresh();
      } catch {
        setEntries(previousEntries);
      } finally {
        setPending(entry.id);
      }
    });
  }

  const revenueEntries = entries.filter((entry) => entry.type === "RECEITA");
  const expenseEntries = entries.filter((entry) => entry.type === "DESPESA");

  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
          <CardDescription>Clientes fixos, freelances e projetos unicos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {revenueEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              pendingAction={pendingActions[entry.id]}
              onTogglePaid={togglePaid}
              onDelete={deleteEntry}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
          <CardDescription>Assinaturas, equipamentos, freelancers e custos avulsos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenseEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              pendingAction={pendingActions[entry.id]}
              onTogglePaid={togglePaid}
              onDelete={deleteEntry}
            />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
