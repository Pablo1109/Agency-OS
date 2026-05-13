"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleDollarSign, CreditCard, Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createFinanceAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/format";

type FinanceClient = {
  id: string;
  name: string;
  company: string;
  monthlyValue: number;
  plan: string;
};

export function NewFinanceWizard({ clients }: { clients: FinanceClient[] }) {
  const [type, setType] = useState<"RECEITA" | "DESPESA">("RECEITA");
  const [revenueMode, setRevenueMode] = useState<"CLIENTE" | "FREELA">("CLIENTE");
  const [paymentKind, setPaymentKind] = useState<"AVISTA" | "PARCELADO">("AVISTA");
  const [recurringExpense, setRecurringExpense] = useState(false);
  const [clientId, setClientId] = useState("");

  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clientId, clients]);

  return (
    <form action={createFinanceAction} className="grid gap-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="paid" value={type === "RECEITA" || paymentKind === "AVISTA" ? "on" : ""} />
      {paymentKind === "PARCELADO" ? <input type="hidden" name="installment" value="on" /> : null}

      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-2">
        <button
          type="button"
          onClick={() => setType("RECEITA")}
          className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium ${type === "RECEITA" ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
        >
          <CircleDollarSign className="h-4 w-4" />
          Receita
        </button>
        <button
          type="button"
          onClick={() => setType("DESPESA")}
          className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium ${type === "DESPESA" ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
        >
          <ReceiptText className="h-4 w-4" />
          Despesa
        </button>
      </div>

      {type === "RECEITA" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={revenueMode === "CLIENTE" ? "default" : "outline"} onClick={() => setRevenueMode("CLIENTE")}>
              Cliente
            </Button>
            <Button type="button" variant={revenueMode === "FREELA" ? "default" : "outline"} onClick={() => setRevenueMode("FREELA")}>
              Freela
            </Button>
          </div>

          {revenueMode === "CLIENTE" ? (
            <div className="grid gap-2">
              <Label htmlFor="clientId">Qual cliente pagou?</Label>
              <Select id="clientId" name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} required>
                <option value="">Selecione</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name} - {formatCurrency(client.monthlyValue)}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <input type="hidden" name="category" value={revenueMode === "CLIENTE" ? "Cliente fixo" : "Freelance"} />
          <div className="grid gap-2">
            <Label htmlFor="description">Descricao</Label>
            <Input
              key={`description-${selectedClient?.id ?? revenueMode}`}
              id="description"
              name="description"
              defaultValue={selectedClient ? `Pagamento ${selectedClient.company || selectedClient.name}` : ""}
              placeholder={revenueMode === "CLIENTE" ? "Mensalidade, quinzenal, semanal..." : "Projeto, job avulso..."}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor recebido</Label>
              <Input key={`amount-${selectedClient?.id ?? revenueMode}`} id="amount" name="amount" type="number" step="0.01" defaultValue={selectedClient?.monthlyValue || ""} placeholder="500" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Metodo</Label>
              <Input id="paymentMethod" name="paymentMethod" placeholder="Pix, cartao, boleto" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data do recebimento</Label>
            <Input id="date" name="date" type="date" />
          </div>
          <Button type="submit">
            <CheckCircle2 className="h-4 w-4" />
            Confirmar receita
          </Button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={paymentKind === "AVISTA" ? "default" : "outline"} onClick={() => setPaymentKind("AVISTA")}>
              A vista
            </Button>
            <Button type="button" variant={paymentKind === "PARCELADO" ? "default" : "outline"} onClick={() => setPaymentKind("PARCELADO")}>
              <CreditCard className="h-4 w-4" />
              Parcelado
            </Button>
          </div>

          <input type="hidden" name="clientId" value="" />
          <div className="grid gap-2">
            <Label htmlFor="expenseDescription">O que voce comprou/pagou?</Label>
            <Input id="expenseDescription" name="description" placeholder="Notebook, Canva, editor freelancer..." required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="expenseCategory">Categoria</Label>
              <Input id="expenseCategory" name="category" placeholder="Equipamento, assinatura..." required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expenseAmount">{paymentKind === "PARCELADO" ? "Valor de cada parcela" : "Valor pago"}</Label>
              <Input id="expenseAmount" name="amount" type="number" step="0.01" placeholder="500" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expensePaymentMethod">Forma de pagamento</Label>
            <Input id="expensePaymentMethod" name="paymentMethod" placeholder="Cartao, Pix, boleto" />
          </div>
          {paymentKind === "AVISTA" ? (
            <div className="grid gap-3 rounded-md border bg-muted/30 p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="recurring"
                  className="h-4 w-4"
                  checked={recurringExpense}
                  onChange={(event) => setRecurringExpense(event.target.checked)}
                />
                Despesa recorrente fixa
              </label>
              {recurringExpense ? (
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceFrequency">Frequencia</Label>
                  <Select id="recurrenceFrequency" name="recurrenceFrequency" defaultValue="MENSAL">
                    <option value="MENSAL">Mensal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="PERSONALIZADO">Personalizado</option>
                  </Select>
                </div>
              ) : null}
            </div>
          ) : null}
          {paymentKind === "PARCELADO" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="installments">Quantas parcelas?</Label>
                <Input id="installments" name="installments" type="number" min="2" max="120" placeholder="6" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">1o vencimento</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="date">Data do pagamento</Label>
              <Input id="date" name="date" type="date" />
            </div>
          )}
          <Button type="submit">
            <Plus className="h-4 w-4" />
            {paymentKind === "PARCELADO" ? "Gerar parcelas" : "Salvar despesa"}
          </Button>
        </>
      )}
    </form>
  );
}
