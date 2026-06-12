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
  dueDays: z.string().optional().or(z.literal("")),
  billingFrequency: z.enum(["MENSAL", "QUINZENAL", "SEMANAL", "PERSONALIZADO"]).default("MENSAL"),
  status: z.enum(["ATIVO", "PROSPECT", "PAUSADO", "INADIMPLENTE", "ENCERRADO"]).default("PROSPECT"),
  notes: z.string().optional()
});

function clientData(data: z.infer<typeof clientSchema>) {
  return {
    name: data.name,
    company: data.company || null,
    phone: data.phone || null,
    instagram: data.instagram || null,
    email: data.email || null,
    niche: data.niche || null,
    plan: data.plan || null,
    monthlyValue: data.monthlyValue,
    dueDay: data.dueDay,
    dueDays: data.dueDays || String(data.dueDay),
    billingFrequency: data.billingFrequency,
    status: data.status,
    notes: data.notes || null
  };
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
    data: clientData(parsed.data)
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

const clientIdSchema = z.object({
  clientId: z.string().min(1)
});

const updateClientSchema = clientSchema.extend({
  clientId: z.string().min(1)
});

export async function updateClientAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = updateClientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const { clientId, ...client } = parsed.data;

  await prisma.client.updateMany({
    where: { id: clientId },
    data: clientData(client)
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function deleteClientAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = clientIdSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.client.deleteMany({
    where: { id: parsed.data.clientId }
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

const clientStatusSchema = clientIdSchema.extend({
  status: z.enum(["ATIVO", "PROSPECT", "PAUSADO", "INADIMPLENTE", "ENCERRADO"])
});

export async function updateClientStatusAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = clientStatusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.client.updateMany({
    where: { id: parsed.data.clientId },
    data: { status: parsed.data.status }
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

const clientCredentialSchema = z.object({
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

  const parsed = clientCredentialSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.clientCredential.create({
    data: {
      clientId: parsed.data.clientId,
      platform: parsed.data.platform,
      login: parsed.data.login || null,
      password: parsed.data.password || null,
      notes: parsed.data.notes || null
    }
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
  installments: z.coerce.number().optional(),
  currentPart: z.coerce.number().optional(),
  clientId: z.string().optional().or(z.literal(""))
});

export async function createFinanceAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = financeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.create({
    data: {
      type: parsed.data.type,
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      paymentMethod: parsed.data.paymentMethod || null,
      paid: parsed.data.paid === "on" || parsed.data.paid === "true",
      recurring: parsed.data.recurring === "on" || parsed.data.recurring === "true",
      recurrenceFrequency: parsed.data.recurrenceFrequency || null,
      installment: parsed.data.installment === "on" || parsed.data.installment === "true",
      installments: parsed.data.installments || null,
      currentPart: parsed.data.currentPart || null,
      clientId: parsed.data.clientId || null
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/dashboard");
}

export async function createFinanceEntryAction(formData: FormData) {
  return createFinanceAction(formData);
}

const financeIdSchema = z.object({
  financeId: z.string().min(1)
});

function normalizeFinanceId(formData: FormData) {
  return String(formData.get("financeId") ?? formData.get("entryId") ?? formData.get("id") ?? "");
}

export async function deleteFinanceAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const normalized = new FormData();
  normalized.set("financeId", normalizeFinanceId(formData));
  const parsed = financeIdSchema.safeParse(Object.fromEntries(normalized));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.deleteMany({
    where: { id: parsed.data.financeId }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/dashboard");
}

export async function deleteFinanceEntryAction(formData: FormData) {
  return deleteFinanceAction(formData);
}

const financePaidSchema = financeIdSchema.extend({
  paid: z.enum(["true", "false"])
});

export async function updateFinancePaidAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const rawPaid = String(formData.get("paid") ?? formData.get("isPaid") ?? "true");
  const normalized = new FormData();
  normalized.set("financeId", normalizeFinanceId(formData));
  normalized.set("paid", ["true", "1", "on", "yes", "sim"].includes(rawPaid.toLowerCase()) ? "true" : "false");
  const parsed = financePaidSchema.safeParse(Object.fromEntries(normalized));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.updateMany({
    where: { id: parsed.data.financeId },
    data: { paid: parsed.data.paid === "true" }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/dashboard");
}

export async function markFinancePaidAction(formData: FormData) {
  return updateFinancePaidAction(formData);
}

export async function updateFinanceEntryPaidAction(formData: FormData) {
  return updateFinancePaidAction(formData);
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
      description: parsed.data.description || "Pro-labore",
      category: "Pro-labore",
      amount: parsed.data.amount,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      dueDate: parsed.data.date ? new Date(parsed.data.date) : null,
      paymentMethod: parsed.data.paymentMethod || null,
      paid: true,
      recurring: false,
      installment: false
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/pro-labore");
  revalidatePath("/dashboard");
}

const recurringFinanceSchema = z.object({
  entryId: z.string().min(1),
  description: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z.string().optional().or(z.literal("")),
  recurrenceFrequency: z.string().optional(),
  paymentMethod: z.string().optional(),
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

  await prisma.financialEntry.updateMany({
    where: { id: parsed.data.entryId },
    data: {
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      paymentMethod: parsed.data.paymentMethod || null,
      recurrenceFrequency: parsed.data.recurrenceFrequency || null,
      recurring: parsed.data.recurring === "on" || parsed.data.recurring === "true"
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/recorrencias");
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
