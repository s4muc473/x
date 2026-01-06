import { Project, TeamMember, Month } from './types';

// Helper to fill array with value
const fill = (val: number, count: number) => Array(count).fill(val);

// Based on "Salários e Ordenados" and specific breakdown:
// Jan/Feb: Lower (CLT values est). Mar-Dec: Higher (PJ/Full values).
// Laio: 2100 (Jan-Feb) -> 8750 (Mar-Dec)
// Luiz: 2250 (Jan-Feb) -> 8750 (Mar-Dec)
// Samuel: Est 3000 (Jan-Feb) -> Est 3000 (Mar-Dec) (CLT Stable + Encargos)
// Rodrigo: Est 0 or Low (Jan-Feb) -> 10000 (Mar-Dec)
// Aprendiz: 962.53 (All Year)

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'laio',
    name: 'Laio',
    role: 'PJ / Analista',
    monthlyCost: [...fill(2100, 2), ...fill(8750, 10)]
  },
  {
    id: 'luiz',
    name: 'Luiz Nelson',
    role: 'PJ / Analista',
    monthlyCost: [...fill(2250, 2), ...fill(8750, 10)]
  },
  {
    id: 'samuel',
    name: 'Samuel',
    role: 'CLT / Analista',
    // Estimating total cost to company (Sal + Encargos ~ 1.6x salary or based on payroll diff)
    // Let's use a flat estimated cost based on the "Despesas Pessoal" totals minus the known PJs.
    monthlyCost: [...fill(4500, 12)] 
  },
  {
    id: 'rodrigo',
    name: 'Rodrigo',
    role: 'Consultor',
    monthlyCost: [...fill(10000, 12)] // Assuming flat for simplification or modify if he starts later
  },
  {
    id: 'aprendiz',
    name: 'Jovem Aprendiz',
    role: 'Aprendiz',
    monthlyCost: [...fill(962.53 * 1.02, 12)] // +2% FGTS
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Auditoria Automatizada",
    objective: "Garantir que a empresa não perca receita",
    startMonth: Month.Janeiro,
    durationMonths: 6,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: { 'luiz': 60, 'laio': 40, 'samuel': 30, 'rodrigo': 5 }
  },
  {
    id: 2,
    name: "Chat Data (Consulta Rápida)",
    objective: "Acelerar decisões da liderança",
    startMonth: Month.Julho,
    durationMonths: 6, // Adjusted to fit year end for 2026 visualization
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: { 'luiz': 60, 'laio': 30, 'samuel': 30, 'rodrigo': 5 }
  },
  {
    id: 3,
    name: "Fábrica de Processos Padronizados",
    objective: "Reduzir tempo de implantação",
    startMonth: Month.Janeiro,
    durationMonths: 7,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: { 'luiz': 30, 'laio': 30, 'rodrigo': 10 }
  },
  {
    id: 4,
    name: "Prog. Desenv. Lideranças em IA",
    objective: "Melhorar qualidade da gestão",
    startMonth: Month.Junho,
    durationMonths: 5,
    teamIds: ['luiz', 'rodrigo'],
    allocations: {}
  },
  {
    id: 5,
    name: "Automatização Operacional Central",
    objective: "Aumentar eficiência operacional",
    startMonth: Month.Abril,
    durationMonths: 9,
    teamIds: ['samuel', 'laio', 'rodrigo'],
    allocations: {}
  },
  {
    id: 6,
    name: "Eficiência Operacional Atendimento",
    objective: "Garantir qualidade com crescimento",
    startMonth: Month.Janeiro,
    durationMonths: 3,
    teamIds: [],
    allocations: {}
  },
  {
    id: 7,
    name: "Análise de Dados de RH",
    objective: "Apoiar decisões de pessoas",
    startMonth: Month.Abril,
    durationMonths: 8,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 8,
    name: "Gestão de Brindes no Marketing",
    objective: "Trazer maior controle patrimonial",
    startMonth: Month.Janeiro, // Started Dec 2025, implies active Jan 2026
    durationMonths: 1,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 9,
    name: "Revisão Geral sobre Processos",
    objective: "Revisão de processos e indicadores",
    startMonth: Month.Janeiro,
    durationMonths: 10,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 10,
    name: "Wiki para os Clientes",
    objective: "Clientes tirarem dúvidas",
    startMonth: Month.Janeiro,
    durationMonths: 5,
    teamIds: ['samuel', 'rodrigo', 'laio'],
    allocations: {}
  },
  {
    id: 11,
    name: "IA treinada base Wiki Clientes",
    objective: "IA treinada com base de conhecimento",
    startMonth: Month.Julho,
    durationMonths: 5,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 12,
    name: "Gestão de Sprint e Atividades",
    objective: "Sistema para gestão de atividades",
    startMonth: Month.Janeiro,
    durationMonths: 3,
    teamIds: ['samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 13,
    name: "Ferramenta Padronizar Solicitações",
    objective: "Padronizar preenchimento",
    startMonth: Month.Março,
    durationMonths: 3,
    teamIds: ['samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 14,
    name: "Abertura Vinculadas Automáticas",
    objective: "Execução integrada e rastreável",
    startMonth: Month.Março,
    durationMonths: 3,
    teamIds: ['luiz', 'samuel', 'rodrigo'],
    allocations: {}
  },
  {
    id: 15,
    name: "Manutenção e Melhoria Contínua",
    objective: "20% do tempo",
    startMonth: Month.Janeiro,
    durationMonths: 12,
    teamIds: ['aprendiz', 'samuel', 'laio'],
    allocations: { 'aprendiz': 100, 'samuel': 20, 'laio': 20 }
  }
];

export const TOTAL_BUDGET_2026 = 405000.00;
