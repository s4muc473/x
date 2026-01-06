import React, { useState } from 'react';
import { Project, TeamMember, Month } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Cell
} from 'recharts';
import { DollarSign, PieChart, TrendingUp, Calendar, Filter, Globe } from 'lucide-react';

interface FinancialDashboardProps {
  projects: Project[];
  team: TeamMember[];
  monthlyData: any[]; // Calculated monthly financial flows
  projectCosts: { name: string; cost: number; percentage: number }[];
  totalBudget: number;
  totalProjectedCost: number;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  projects,
  monthlyData, 
  projectCosts, 
  totalBudget, 
  totalProjectedCost 
}) => {
  // 0 = Annual View (All Year), 1-12 = Specific Month
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getMonthName = (m: number) => Month[m];

  // --- Metrics Logic (Switch betwen Annual vs Monthly) ---
  const isAnnualView = selectedMonth === 0;

  // 1. Projects Count
  // Annual: Total projects registered
  // Monthly: Projects active in that specific timeframe
  const activeProjectsCount = isAnnualView
    ? projects.length
    : projects.filter(p => {
        const endMonth = p.startMonth + p.durationMonths - 1;
        return selectedMonth >= p.startMonth && selectedMonth <= endMonth;
      }).length;

  // 2. Financials
  // Annual: Total Projected vs Total Budget
  // Monthly: Monthly Cost vs Monthly Average Budget
  const currentCost = isAnnualView
    ? totalProjectedCost
    : monthlyData.find(d => d.monthIndex === selectedMonth)?.totalCost || 0;

  const currentBudgetLimit = isAnnualView
    ? totalBudget
    : totalBudget / 12;

  const usagePct = (currentCost / currentBudgetLimit) * 100;
  
  // Auxiliary metric for Card 3 (Budget Gap)
  const budgetRemaining = totalBudget - totalProjectedCost;

  return (
    <div className="space-y-6">
      
      {/* Month Selector / Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 whitespace-nowrap">
           <Filter className="w-5 h-5 text-indigo-500" />
           <span className="font-semibold">Visualização:</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
           
           {/* Annual View Button */}
           <button
             onClick={() => setSelectedMonth(0)}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border
               ${selectedMonth === 0 
                 ? 'bg-indigo-700 text-white border-indigo-700 shadow-md' 
                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'}
             `}
           >
             <Globe className="w-3 h-3" />
             2026 (Ano Todo)
           </button>

           <div className="w-px h-6 bg-slate-200 mx-1"></div>

           {/* Monthly Buttons */}
           {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
             <button
               key={m}
               onClick={() => setSelectedMonth(m)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border
                 ${selectedMonth === m 
                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                   : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-200'}
               `}
             >
               {getMonthName(m).substring(0, 3)}
             </button>
           ))}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Projects Count */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-colors">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isAnnualView ? 'Total de Projetos Planejados' : `Projetos Ativos em ${getMonthName(selectedMonth)}`}
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{activeProjectsCount}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
           <p className="text-xs text-slate-400 mt-4">
            {isAnnualView 
              ? 'Projetos cadastrados na carteira de 2026' 
              : 'Baseado no cronograma (Início + Duração)'}
          </p>
        </div>

        {/* Card 2: Cost (Annual or Monthly) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isAnnualView ? 'investimento Total Projetado (Ano)' : `investimento Pessoal (${getMonthName(selectedMonth)})`}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(currentCost)}</h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${usagePct > 100 ? 'bg-red-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.min(usagePct, 100)}%` }}
            ></div>
          </div>
          <p className={`text-xs mt-2 ${usagePct > 100 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {usagePct.toFixed(1)}% {isAnnualView ? 'do orçamento total' : 'da média mensal'}
          </p>
        </div>

        {/* Card 3: Budget Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                 {isAnnualView ? 'Saldo do Orçamento Anual' : 'Disponível no Ano (Projeção)'}
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${budgetRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(budgetRemaining)}
              </h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
             <div className="flex justify-between text-xs text-slate-500">
               <span>Teto: {formatCurrency(totalBudget)}</span>
             </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
             {budgetRemaining < 0 ? 'Atenção: Orçamento anual estourado.' : 'Dentro da meta orçamentária.'}
          </p>
        </div>

      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cash Flow Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            Fluxo de investimento Mensal (2026)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="totalCost" name="investimento Pessoal" radius={[4, 4, 0, 0]} barSize={30}>
                    {monthlyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            isAnnualView 
                              ? '#6366f1' // Default color for all
                              : entry.monthIndex === selectedMonth ? '#4f46e5' : '#c7d2fe' // Highlight selected
                          } 
                        />
                    ))}
                </Bar>
                <Line type="monotone" dataKey="budgetLimit" name="Budget Médio" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-500" />
            Top Projetos (investimento Anual Acumulado)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={projectCosts.slice(0, 10)} margin={{ top: 0, right: 40, left: 40, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={150} fontSize={11} tick={{fill: '#475569'}} />
                 <Tooltip 
                   formatter={(value: number) => formatCurrency(value)}
                   cursor={{fill: '#f1f5f9'}}
                 />
                 <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;