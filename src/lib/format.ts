import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatRelativeDay(date: Date | string) {
  const parsed = new Date(date);

  if (isToday(parsed)) {
    return "Hoje";
  }

  if (isTomorrow(parsed)) {
    return "Amanha";
  }

  return format(parsed, "dd MMM", { locale: ptBR });
}
