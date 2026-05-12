import type { ClientStatus, LeadStatus, TaskPriority, TaskStatus } from "./types";

export const clientStatusLabels: Record<ClientStatus, string> = {
  ATIVO: "Ativo",
  PROSPECT: "Prospect",
  PAUSADO: "Pausado",
  INADIMPLENTE: "Inadimplente",
  ENCERRADO: "Encerrado"
};

export const clientStatusTone: Record<ClientStatus, string> = {
  ATIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROSPECT: "bg-sky-50 text-sky-700 border-sky-200",
  PAUSADO: "bg-amber-50 text-amber-700 border-amber-200",
  INADIMPLENTE: "bg-rose-50 text-rose-700 border-rose-200",
  ENCERRADO: "bg-slate-100 text-slate-600 border-slate-200"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  A_FAZER: "A Fazer",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  FINALIZADO: "Finalizado"
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente"
};

export const taskPriorityTone: Record<TaskPriority, string> = {
  BAIXA: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIA: "bg-sky-50 text-sky-700 border-sky-200",
  ALTA: "bg-amber-50 text-amber-700 border-amber-200",
  URGENTE: "bg-rose-50 text-rose-700 border-rose-200"
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  LEAD_NOVO: "Lead novo",
  CONTATO_FEITO: "Contato feito",
  PROPOSTA_ENVIADA: "Proposta enviada",
  NEGOCIACAO: "Negociacao",
  FECHADO: "Fechado",
  PERDIDO: "Perdido"
};
