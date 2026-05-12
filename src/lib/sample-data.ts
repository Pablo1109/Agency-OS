import type { AppData } from "./types";

const today = new Date();
const day = 24 * 60 * 60 * 1000;

const iso = (offsetDays: number) => new Date(today.getTime() + offsetDays * day).toISOString();

export const sampleData: AppData = {
  clients: [
    {
      id: "cli-vila-fit",
      name: "Camila Andrade",
      company: "Vila Fit Studio",
      phone: "(11) 98888-1010",
      instagram: "@vilafitstudio",
      email: "contato@vilafit.com",
      niche: "Academia boutique",
      plan: "Crescimento",
      monthlyValue: 1800,
      dueDay: 10,
      notes: "Conteudo mensal com reels, fotos e gestao de calendario.",
      status: "ATIVO",
      services: [
        {
          id: "srv-vila-social",
          clientId: "cli-vila-fit",
          name: "Social Media",
          quantity: 12,
          unit: "posts",
          monthlyIncluded: true,
          notes: "Inclui 4 reels curtos."
        },
        {
          id: "srv-vila-stories",
          clientId: "cli-vila-fit",
          name: "Stories",
          quantity: 20,
          unit: "stories",
          monthlyIncluded: true
        }
      ]
    },
    {
      id: "cli-brasa",
      name: "Rafael Lima",
      company: "Brasa & Ponto",
      phone: "(11) 97777-2020",
      instagram: "@brasaeponto",
      email: "rafael@brasaeponto.com",
      niche: "Restaurante",
      plan: "Performance",
      monthlyValue: 2500,
      dueDay: 15,
      notes: "Precisa aprovar artes com 48h de antecedencia.",
      status: "ATIVO",
      services: [
        {
          id: "srv-brasa-foto",
          clientId: "cli-brasa",
          name: "Fotografia",
          quantity: 1,
          unit: "diaria mensal",
          monthlyIncluded: true
        },
        {
          id: "srv-brasa-trafego",
          clientId: "cli-brasa",
          name: "Gestao de trafego",
          monthlyIncluded: true,
          notes: "Verba de midia paga por fora."
        }
      ]
    },
    {
      id: "cli-arq",
      name: "Marina Rocha",
      company: "MR Arquitetura",
      phone: "(11) 96666-3030",
      instagram: "@mrarquitetura",
      email: "marina@mrarq.com",
      niche: "Arquitetura",
      plan: "Essencial",
      monthlyValue: 1200,
      dueDay: 5,
      notes: "Prospect em fase de proposta.",
      status: "PROSPECT",
      services: [
        {
          id: "srv-arq-site",
          clientId: "cli-arq",
          name: "Site institucional",
          monthlyIncluded: false,
          notes: "Projeto unico previsto para o proximo mes."
        }
      ]
    },
    {
      id: "cli-auto",
      name: "Joao Batista",
      company: "AutoPrime",
      phone: "(11) 95555-4040",
      instagram: "@autoprime",
      email: "financeiro@autoprime.com",
      niche: "Estetica automotiva",
      plan: "Crescimento",
      monthlyValue: 1600,
      dueDay: 2,
      notes: "Pagamento atrasado; priorizar cobranca amigavel.",
      status: "INADIMPLENTE",
      services: [
        {
          id: "srv-auto-design",
          clientId: "cli-auto",
          name: "Design",
          quantity: 10,
          unit: "artes",
          monthlyIncluded: true
        }
      ]
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Roteiro de reels treino funcional",
      description: "Preparar 3 ideias com gancho forte e CTA para aula experimental.",
      clientId: "cli-vila-fit",
      clientName: "Vila Fit Studio",
      priority: "URGENTE",
      dueDate: iso(0),
      status: "A_FAZER",
      attachments: []
    },
    {
      id: "task-2",
      title: "Editar carrossel cardapio executivo",
      description: "Ajustar preco, trocar foto principal e mandar para aprovacao.",
      clientId: "cli-brasa",
      clientName: "Brasa & Ponto",
      priority: "ALTA",
      dueDate: iso(1),
      status: "EM_ANDAMENTO",
      attachments: []
    },
    {
      id: "task-3",
      title: "Cobrar referencias de fachada",
      description: "Cliente precisa enviar fotos para fechar identidade visual da campanha.",
      clientId: "cli-auto",
      clientName: "AutoPrime",
      priority: "MEDIA",
      dueDate: iso(2),
      status: "AGUARDANDO_CLIENTE",
      attachments: []
    },
    {
      id: "task-4",
      title: "Proposta site MR Arquitetura",
      description: "Fechar escopo com 5 paginas, formulario e portfolio.",
      clientId: "cli-arq",
      clientName: "MR Arquitetura",
      priority: "ALTA",
      dueDate: iso(3),
      status: "A_FAZER",
      attachments: []
    },
    {
      id: "task-5",
      title: "Exportar pacote de artes da semana",
      description: "Salvar artes aprovadas no Drive e registrar entrega.",
      clientId: "cli-vila-fit",
      clientName: "Vila Fit Studio",
      priority: "BAIXA",
      dueDate: iso(-1),
      status: "FINALIZADO",
      attachments: []
    }
  ],
  finances: [
    {
      id: "fin-1",
      type: "RECEITA",
      description: "Mensalidade Vila Fit",
      category: "Cliente fixo",
      amount: 1800,
      date: iso(-4),
      dueDate: iso(-2),
      paymentMethod: "Pix",
      paid: true,
      recurring: true,
      installment: false,
      clientId: "cli-vila-fit",
      clientName: "Vila Fit Studio"
    },
    {
      id: "fin-2",
      type: "RECEITA",
      description: "Mensalidade Brasa & Ponto",
      category: "Cliente fixo",
      amount: 2500,
      date: iso(-2),
      dueDate: iso(3),
      paymentMethod: "Pix",
      paid: false,
      recurring: true,
      installment: false,
      clientId: "cli-brasa",
      clientName: "Brasa & Ponto"
    },
    {
      id: "fin-3",
      type: "RECEITA",
      description: "Arte avulsa campanha Dia dos Namorados",
      category: "Freelance",
      amount: 450,
      date: iso(-7),
      paymentMethod: "Pix",
      paid: true,
      recurring: false,
      installment: false
    },
    {
      id: "fin-4",
      type: "DESPESA",
      description: "Adobe Creative Cloud",
      category: "Assinaturas",
      amount: 224.9,
      date: iso(-8),
      dueDate: iso(7),
      paid: true,
      recurring: true,
      installment: false
    },
    {
      id: "fin-5",
      type: "DESPESA",
      description: "Canva Pro",
      category: "Assinaturas",
      amount: 34.9,
      date: iso(-6),
      dueDate: iso(5),
      paid: true,
      recurring: true,
      installment: false
    },
    {
      id: "fin-6",
      type: "DESPESA",
      description: "Lente 50mm",
      category: "Equipamentos",
      amount: 190,
      date: iso(-1),
      dueDate: iso(9),
      paid: false,
      recurring: false,
      installment: true,
      installments: 6,
      currentPart: 2
    },
    {
      id: "fin-7",
      type: "DESPESA",
      description: "Editor freelancer",
      category: "Freelancers terceirizados",
      amount: 380,
      date: iso(-3),
      dueDate: iso(2),
      paid: false,
      recurring: false,
      installment: false
    }
  ],
  content: [
    {
      id: "content-1",
      clientId: "cli-vila-fit",
      clientName: "Vila Fit Studio",
      publishDate: iso(1),
      theme: "Aula experimental sem medo",
      status: "AGENDADO",
      approved: true,
      published: false
    },
    {
      id: "content-2",
      clientId: "cli-brasa",
      clientName: "Brasa & Ponto",
      publishDate: iso(2),
      theme: "Prato executivo da semana",
      status: "APROVACAO",
      approved: false,
      published: false
    },
    {
      id: "content-3",
      clientId: "cli-auto",
      clientName: "AutoPrime",
      publishDate: iso(4),
      theme: "Antes e depois polimento",
      status: "PRODUCAO",
      approved: false,
      published: false
    }
  ],
  leads: [
    {
      id: "lead-1",
      name: "Leticia Martins",
      company: "Bella Derm",
      phone: "(11) 94444-5050",
      desiredService: "Social media + trafego",
      estimatedBudget: 1800,
      status: "PROPOSTA_ENVIADA"
    },
    {
      id: "lead-2",
      name: "Carlos Nunes",
      company: "CN Imoveis",
      phone: "(11) 93333-6060",
      desiredService: "Site + identidade visual",
      estimatedBudget: 3200,
      status: "NEGOCIACAO"
    }
  ]
};
