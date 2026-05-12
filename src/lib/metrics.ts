import type { AppData, FinancialEntry, Task } from "./types";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function isSameMonth(date: string, base = new Date()) {
  const parsed = new Date(date);
  return parsed.getMonth() === base.getMonth() && parsed.getFullYear() === base.getFullYear();
}

function sum(entries: FinancialEntry[]) {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

export function getDashboardMetrics(data: AppData) {
  const monthRevenue = data.finances.filter(
    (entry) => entry.type === "RECEITA" && entry.paid && isSameMonth(entry.date)
  );
  const monthExpenses = data.finances.filter(
    (entry) => entry.type === "DESPESA" && entry.paid && isSameMonth(entry.date)
  );
  const pendingPayments = data.finances.filter((entry) => entry.type === "RECEITA" && !entry.paid);
  const pendingBills = data.finances.filter((entry) => entry.type === "DESPESA" && !entry.paid);
  const pendingTasks = data.tasks.filter((task) => task.status !== "FINALIZADO");
  const urgentTasks = pendingTasks.filter((task) => task.priority === "URGENTE" || task.priority === "ALTA");

  return {
    revenue: sum(monthRevenue),
    expenses: sum(monthExpenses),
    profit: sum(monthRevenue) - sum(monthExpenses),
    activeClients: data.clients.filter((client) => client.status === "ATIVO").length,
    pendingTasks: pendingTasks.length,
    urgentTasks,
    pendingPayments,
    pendingBills,
    overdueClients: data.clients.filter((client) => client.status === "INADIMPLENTE"),
    upcomingContent: data.content.slice(0, 5)
  };
}

export function getFinanceChart(entries: FinancialEntry[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthNames[date.getMonth()],
      receita: 0,
      despesa: 0,
      lucro: 0
    };
  });

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = months.find((month) => month.key === key);

    if (!bucket || !entry.paid) {
      return;
    }

    if (entry.type === "RECEITA") {
      bucket.receita += entry.amount;
    } else {
      bucket.despesa += entry.amount;
    }

    bucket.lucro = bucket.receita - bucket.despesa;
  });

  return months;
}

export function groupTasksByStatus(tasks: Task[]) {
  return {
    A_FAZER: tasks.filter((task) => task.status === "A_FAZER"),
    EM_ANDAMENTO: tasks.filter((task) => task.status === "EM_ANDAMENTO"),
    AGUARDANDO_CLIENTE: tasks.filter((task) => task.status === "AGUARDANDO_CLIENTE"),
    FINALIZADO: tasks.filter((task) => task.status === "FINALIZADO")
  };
}
