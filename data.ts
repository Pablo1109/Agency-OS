import { sampleData } from "./sample-data";
import type { AppData } from "./types";

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value ?? 0);
}

function iso(value: Date | string | null | undefined) {
  return value ? new Date(value).toISOString() : undefined;
}

export async function getAppData(): Promise<AppData> {
  if (!process.env.DATABASE_URL) {
    return sampleData;
  }

  try {
    const { prisma } = await import("./prisma");

    const [clients, tasks, finances, content, leads] = await Promise.all([
      prisma.client.findMany({
        orderBy: [{ status: "asc" }, { name: "asc" }],
        include: { services: true }
      }),
      prisma.task.findMany({
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        include: { client: true }
      }),
      prisma.financialEntry.findMany({
        orderBy: [{ date: "desc" }],
        include: { client: true }
      }),
      prisma.contentItem.findMany({
        orderBy: [{ publishDate: "asc" }],
        include: { client: true }
      }),
      prisma.lead.findMany({
        orderBy: [{ updatedAt: "desc" }]
      })
    ]);

    return {
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        company: client.company ?? "",
        phone: client.phone ?? "",
        instagram: client.instagram ?? "",
        email: client.email ?? "",
        niche: client.niche ?? "",
        plan: client.plan ?? "",
        monthlyValue: toNumber(client.monthlyValue),
        dueDay: client.dueDay ?? 1,
        dueDays: client.dueDays ?? String(client.dueDay ?? 1),
        billingFrequency: client.billingFrequency ?? "MENSAL",
        notes: client.notes ?? "",
        status: client.status,
        services: client.services.map((service) => ({
          id: service.id,
          clientId: service.clientId,
          name: service.name,
          quantity: service.quantity ?? undefined,
          unit: service.unit ?? undefined,
          monthlyIncluded: service.monthlyIncluded,
          notes: service.notes ?? undefined
        }))
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        clientId: task.clientId ?? undefined,
        clientName: task.client?.company ?? task.client?.name,
        priority: task.priority,
        dueDate: iso(task.dueDate),
        status: task.status,
        attachments: task.attachments
      })),
      finances: finances.map((entry) => ({
        id: entry.id,
        type: entry.type,
        description: entry.description,
        category: entry.category,
        amount: toNumber(entry.amount),
        date: iso(entry.date) ?? new Date().toISOString(),
        dueDate: iso(entry.dueDate),
        paymentMethod: entry.paymentMethod ?? undefined,
        paid: entry.paid,
        recurring: entry.recurring,
        installment: entry.installment,
        installments: entry.installments ?? undefined,
        currentPart: entry.currentPart ?? undefined,
        clientId: entry.clientId ?? undefined,
        clientName: entry.client?.company ?? entry.client?.name
      })),
      content: content.map((item) => ({
        id: item.id,
        clientId: item.clientId,
        clientName: item.client.company ?? item.client.name,
        publishDate: item.publishDate.toISOString(),
        theme: item.theme,
        status: item.status,
        approved: item.approved,
        published: item.published
      })),
      leads: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        company: lead.company ?? "",
        phone: lead.phone ?? "",
        desiredService: lead.desiredService ?? "",
        estimatedBudget: toNumber(lead.estimatedBudget),
        status: lead.status
      }))
    };
  } catch {
    return sampleData;
  }
}
