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
  status: z.enum(["ATIVO", "PROSPECT", "PAUSADO", "INADIMPLENTE", "ENCERRADO"]).default("PROSPECT"),
  notes: z.string().optional()
});

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
      email: parsed.data.email || null
    }
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
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
  installment: z.string().optional(),
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
      paymentMethod: parsed.data.paymentMethod,
      paid: parsed.data.paid === "on",
      recurring: parsed.data.recurring === "on",
      installment: parsed.data.installment === "on",
      clientId: parsed.data.clientId || null
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

const financeIdSchema = z.object({
  financeId: z.string().min(1)
});

export async function deleteFinanceAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = financeIdSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.deleteMany({
    where: { id: parsed.data.financeId }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

const financePaidSchema = financeIdSchema.extend({
  paid: z.enum(["true", "false"])
});

export async function updateFinancePaidAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = financePaidSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();

  await prisma.financialEntry.updateMany({
    where: { id: parsed.data.financeId },
    data: { paid: parsed.data.paid === "true" }
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
