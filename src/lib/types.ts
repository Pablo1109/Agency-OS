export type ClientStatus =
  | "ATIVO"
  | "PROSPECT"
  | "PAUSADO"
  | "INADIMPLENTE"
  | "ENCERRADO";

export type TaskStatus =
  | "A_FAZER"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_CLIENTE"
  | "FINALIZADO";

export type TaskPriority = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export type FinanceType = "RECEITA" | "DESPESA";

export type BillingFrequency = "MENSAL" | "QUINZENAL" | "SEMANAL" | "PERSONALIZADO";

export type LeadStatus =
  | "LEAD_NOVO"
  | "CONTATO_FEITO"
  | "PROPOSTA_ENVIADA"
  | "NEGOCIACAO"
  | "FECHADO"
  | "PERDIDO";

export type Client = {
  id: string;
  name: string;
  company: string;
  phone: string;
  instagram: string;
  email: string;
  niche: string;
  plan: string;
  monthlyValue: number;
  dueDay: number;
  dueDays: string;
  billingFrequency: BillingFrequency;
  notes: string;
  status: ClientStatus;
  services: ContractedService[];
  credentials: ClientCredential[];
};

export type ClientCredential = {
  id: string;
  clientId: string;
  platform: string;
  login: string;
  password: string;
  notes: string;
};

export type ContractedService = {
  id: string;
  clientId: string;
  name: string;
  quantity?: number;
  unit?: string;
  monthlyIncluded: boolean;
  notes?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
  attachments: string[];
};

export type FinancialEntry = {
  id: string;
  type: FinanceType;
  description: string;
  category: string;
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  paid: boolean;
  recurring: boolean;
  recurrenceFrequency?: string;
  installment: boolean;
  installments?: number;
  currentPart?: number;
  clientId?: string;
  clientName?: string;
};

export type ContentItem = {
  id: string;
  clientId: string;
  clientName: string;
  publishDate: string;
  theme: string;
  status: "IDEIA" | "PRODUCAO" | "APROVACAO" | "AGENDADO" | "PUBLICADO";
  approved: boolean;
  published: boolean;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  desiredService: string;
  estimatedBudget: number;
  status: LeadStatus;
};

export type AppData = {
  clients: Client[];
  tasks: Task[];
  finances: FinancialEntry[];
  content: ContentItem[];
  leads: Lead[];
};
