"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function getPrisma() {
  const { prisma } = await import("./prisma");
  return prisma;
}

const clientSchema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  niche: z.string().optional(),
  plan: z.string().optional(),
  monthlyValue: z.coerce.number().default(0),
  dueDay: z.coerce.number().min(1).max(31).default(1),
  dueDays: z.string().default("1"),
  billingFrequency: z.enum(["MENSAL", "QUINZENAL", "SEMANAL", "PERSONALIZADO"]).default("MENSAL"),
  status: z.enum(["ATIVO", "PROSPECT", "PAUSADO", "INADIMPLENTE", "ENCERRADO"]).default("PROSPECT"),
  notes: z.string().optional()
});

function defaultDueDays(fallback: number, frequency: "MENSAL" | "QUINZENAL" | "SEMANAL" | "PERSONALIZADO") {
  const start = Math.min(Math.max(fallback || 1, 1), 31);

  if (frequency === "QUINZENAL") {
    return [start, Math.min(start + 15, 31)].join(",");
  }

  if (frequency === "SEMANAL") {
    return [start, start + 7, start + 14, start + 21]
      .filter((day) => day <= 31)
      .join(",");
  }

  return String(start);
}

function normalizeDueDays(value: string, fallback: number, frequency: "MENSAL" | "QUINZENAL" | "SEMANAL" | "PERSONALIZADO") {
  const days = value
    .split(/[,\s]+/)
    .map((day) => Number(day.trim()))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31);

  return Array.from(new Set(days)).sort((a, b) => a - b).join(",") || defaultDueDays(fallback, frequency);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);

  if (next.getDate() !== day) {
    next.setDate(0);
  }

  return next;
}

export async function createClientAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.client.create({
    data: {
      ...parsed.data,
      dueDays: normalizeDueDays(parsed.data.dueDays, parsed.data.dueDay, parsed.data.billingFrequency),
      email: parsed.data.email || null
    }
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function updateClientAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const clientId = String(formData.get("clientId") ?? "");
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));

  if (!clientId || !parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.client.update({
    where: { id: clientId },
    data: {
      ...parsed.data,
      dueDays: normalizeDueDays(parsed.data.dueDays, parsed.data.dueDay, parsed.data.billingFrequency),
      email: parsed.data.email || null
    }
  });

  revalidatePath("/clientes");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

const credentialSchema = z.object({
  clientId: z.string().min(1),
  platform: z.string().min(2),
  login: z.string().optional(),
  password: z.string().optional(),
  notes: z.string().optional()
});

export async function createClientCredentialAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = credentialSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.clientCredential.create({
    data: parsed.data
  });

  revalidatePath("/clientes");
}

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  clientId: z.string().optional().or(z.literal("")),
  priority: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).default("MEDIA"),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["A_FAZER", "EM_ANDAMENTO", "AGUARDANDO_CLIENTE", "FINALIZADO"]).default("A_FAZER")
});

export async function createTaskAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = taskSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      clientId: parsed.data.clientId || null,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: parsed.data.status
    }
  });

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

const financeSchema = z.object({
  type: z.enum(["RECEITA", "DESPESA"]),
  description: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  date: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  paid: z.string().optional(),
  recurring: z.string().optional(),
  recurrenceFrequency: z.string().optional(),
  installment: z.string().optional(),
  installments: z.coerce.number().min(1).max(120).optional(),
  clientId: z.string().optional().or(z.literal(""))
});

const clientPaymentSchema = z.object({
  clientId: z.string().min(1),
  amount: z.coerce.number().optional(),
  date: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  description: z.string().optional()
});

export async function registerClientPaymentAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = clientPaymentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId }
  });

  if (!client) {
    return;
  }

  const clientName = client.company || client.name;
  const amount = parsed.data.amount && parsed.data.amount > 0 ? parsed.data.amount : Number(client.monthlyValue);

  await prisma.financialEntry.create({
    data: {
      type: "RECEITA",
      description: parsed.data.description || `Pagamento ${clientName}`,
      category: client.plan ? `Cliente fixo - ${client.plan}` : "Cliente fixo",
      amount,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      paymentMethod: parsed.data.paymentMethod || "Pix",
      paid: true,
      recurring: client.billingFrequency !== "PERSONALIZADO",
      installment: false,
      clientId: client.id
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/clientes");
}

export async function createFinanceAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = financeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const installment = parsed.data.installment === "on";
  const installments = installment ? parsed.data.installments ?? 1 : 1;
  const baseDate = parsed.data.date ? new Date(parsed.data.date) : new Date();
  const baseDueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : baseDate;

  if (installment && installments > 1) {
    await prisma.financialEntry.createMany({
      data: Array.from({ length: installments }, (_, index) => ({
        type: parsed.data.type,
        description: `${parsed.data.description} (${index + 1}/${installments})`,
        category: parsed.data.category,
        amount: parsed.data.amount,
        date: addMonths(baseDate, index),
        dueDate: addMonths(baseDueDate, index),
        paymentMethod: parsed.data.paymentMethod,
        paid: index === 0 && parsed.data.paid === "on",
        recurring: false,
        recurrenceFrequency: null,
        installment: true,
        installments,
        currentPart: index + 1,
        clientId: parsed.data.clientId || null
      }))
    });

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return;
  }

  await prisma.financialEntry.create({
    data: {
      type: parsed.data.type,
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      paymentMethod: parsed.data.paymentMethod,
      paid: parsed.data.paid === "on",
      recurring: parsed.data.recurring === "on",
      recurrenceFrequency: parsed.data.recurring === "on" ? parsed.data.recurrenceFrequency || "MENSAL" : null,
      installment,
      installments: installment ? installments : null,
      currentPart: installment ? 1 : null,
      clientId: parsed.data.clientId || null
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function updateTaskStatusAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!taskId || !["A_FAZER", "EM_ANDAMENTO", "AGUARDANDO_CLIENTE", "FINALIZADO"].includes(status)) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as "A_FAZER" | "EM_ANDAMENTO" | "AGUARDANDO_CLIENTE" | "FINALIZADO"
    }
  });

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function markFinancePaidAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.update({
    where: { id: entryId },
    data: {
      paid: true,
      date: new Date()
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

const recurringFinanceSchema = z.object({
  entryId: z.string().min(1),
  description: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  recurrenceFrequency: z.string().optional(),
  recurring: z.string().optional()
});

export async function updateRecurringFinanceAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = recurringFinanceSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.update({
    where: { id: parsed.data.entryId },
    data: {
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      paymentMethod: parsed.data.paymentMethod,
      recurring: parsed.data.recurring === "on",
      recurrenceFrequency: parsed.data.recurring === "on" ? parsed.data.recurrenceFrequency || "MENSAL" : null
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/recorrencias");
  revalidatePath("/dashboard");
}

const proLaboreSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  description: z.string().optional()
});

export async function createProLaboreAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = proLaboreSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.create({
    data: {
      type: "DESPESA",
      description: parsed.data.description || "Retirada pro-labore",
      category: "Pro-labore",
      amount: parsed.data.amount,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      dueDate: parsed.data.date ? new Date(parsed.data.date) : null,
      paymentMethod: parsed.data.paymentMethod || "Transferencia PF",
      paid: true,
      recurring: false,
      recurrenceFrequency: null,
      installment: false
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}
