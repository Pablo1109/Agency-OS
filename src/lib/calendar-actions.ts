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

const contentSchema = z.object({
  clientId: z.string().min(1),
  publishDate: z.string().min(1),
  theme: z.string().min(2),
  caption: z.string().optional(),
  status: z.enum(["IDEIA", "PRODUCAO", "APROVACAO", "AGENDADO", "PUBLICADO"]).default("IDEIA")
});

function statusFlags(status: "IDEIA" | "PRODUCAO" | "APROVACAO" | "AGENDADO" | "PUBLICADO") {
  return {
    approved: status === "AGENDADO" || status === "PUBLICADO",
    published: status === "PUBLICADO"
  };
}

export async function createContentItemAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = contentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const flags = statusFlags(parsed.data.status);

  await prisma.contentItem.create({
    data: {
      clientId: parsed.data.clientId,
      publishDate: new Date(parsed.data.publishDate),
      theme: parsed.data.theme,
      caption: parsed.data.caption,
      status: parsed.data.status,
      approved: flags.approved,
      published: flags.published
    }
  });

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
}

const updateStatusSchema = z.object({
  contentId: z.string().min(1),
  status: z.enum(["IDEIA", "PRODUCAO", "APROVACAO", "AGENDADO", "PUBLICADO"])
});

export async function updateContentStatusAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const flags = statusFlags(parsed.data.status);

  await prisma.contentItem.update({
    where: { id: parsed.data.contentId },
    data: {
      status: parsed.data.status,
      approved: flags.approved,
      published: flags.published
    }
  });

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
}

const updateContentSchema = contentSchema.extend({
  contentId: z.string().min(1)
});

export async function updateContentItemAction(formData: FormData) {
  if (!hasDatabase()) {
    return;
  }

  const parsed = updateContentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const prisma = await getPrisma();
  const flags = statusFlags(parsed.data.status);

  await prisma.contentItem.update({
    where: { id: parsed.data.contentId },
    data: {
      clientId: parsed.data.clientId,
      publishDate: new Date(parsed.data.publishDate),
      theme: parsed.data.theme,
      caption: parsed.data.caption,
      status: parsed.data.status,
      approved: flags.approved,
      published: flags.published
    }
  });

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
}
