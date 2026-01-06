export enum Month {
  Janeiro = 1,
  Fevereiro,
  Março,
  Abril,
  Maio,
  Junho,
  Julho,
  Agosto,
  Setembro,
  Outubro,
  Novembro,
  Dezembro
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  // Cost per month (index 0 = Jan, 11 = Dec)
  monthlyCost: number[]; 
}

export interface Project {
  id: number;
  name: string;
  objective: string;
  startMonth: number; // 1-12
  durationMonths: number;
  teamIds: string[]; // IDs of members involved
  // Percentage allocation per member for this project (0-100)
  // Assuming a flat allocation across the duration for simplicity in input,
  // but projected across the timeline.
  allocations: Record<string, number>; 
}

export interface FinancialSummary {
  totalBudget: number;
  totalProjectedCost: number;
  costByProject: { projectId: number; cost: number }[];
  monthlyOverload: Record<string, number[]>; // memberId -> array of total allocation % per month
}