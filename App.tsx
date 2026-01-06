import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_PROJECTS, INITIAL_TEAM, TOTAL_BUDGET_2026 } from './constants';
import { Project, TeamMember } from './types';
import AllocationTable from './components/AllocationTable';
import FinancialDashboard from './components/FinancialDashboard';
import TeamManagement from './components/TeamManagement';
import { calculateFinancials } from './utils/calculations';
import { LayoutDashboard, Users, Calculator, Wallet, Settings, Cloud, CheckCircle, Loader2, AlertTriangle, Database } from 'lucide-react';

const API_URL = 'https://x-zeta-beryl.vercel.app/api/data';
const LOCAL_STORAGE_KEY = 'app_data_v1';

type PersistenceMode = 'cloud' | 'local' | 'offline';

const App: React.FC = () => {
  // Initialize with empty arrays to prevent flash of static content before DB load
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'allocation' | 'team'>('dashboard');

  // Persistence State
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('cloud');
  const isFirstLoad = useRef(true);

  // --- DATA LOADING & PERSISTENCE ---

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Try fetching from API
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Server not reachable");
        const data = await res.json();
        
        setProjects(data.projects || []);
        setTeam(data.team || []);
        setPersistenceMode('cloud');
      } catch (err) {
        console.warn("API unavailable, falling back to LocalStorage:", err);
        
        // 2. Fallback to LocalStorage
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setProjects(parsed.projects || INITIAL_PROJECTS);
            setTeam(parsed.team || INITIAL_TEAM);
            setPersistenceMode('local');
          } catch (e) {
            // Corrupt local data
            setProjects(INITIAL_PROJECTS);
            setTeam(INITIAL_TEAM);
            setPersistenceMode('offline');
          }
        } else {
          // 3. Fallback to Constants
          setProjects(INITIAL_PROJECTS);
          setTeam(INITIAL_TEAM);
          setPersistenceMode('offline');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-Save on Changes (Debounced)
  useEffect(() => {
    if (isLoading || isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    setSaveStatus('saving');
    
    const timer = setTimeout(async () => {
      try {
        // Always try to save to API first if mode is cloud or we want to retry
        let savedToCloud = false;
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projects, team })
          });
          if (res.ok) {
            savedToCloud = true;
            setPersistenceMode('cloud');
          }
        } catch (apiErr) {
          // API failed
        }

        // Always save to LocalStorage as backup/cache
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ projects, team }));

        if (savedToCloud) {
          setSaveStatus('saved');
        } else {
          setPersistenceMode('local');
          setSaveStatus('saved'); // It is saved locally, so it's technically "saved"
        }
      } catch (err) {
        console.error("Critical save error:", err);
        setSaveStatus('error');
      }
    }, 1500); 

    return () => clearTimeout(timer);
  }, [projects, team, isLoading]);

  // --- PROJECT ACTIONS ---

  const handleUpdateAllocation = (projectId: number, memberId: string, value: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        allocations: {
          ...p.allocations,
          [memberId]: value
        }
      };
    }));
  };

  const handleUpdateProjectDetails = (projectId: number, field: keyof Project, value: any) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [field]: value } : p));
  };

  const handleAddProject = () => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    setProjects(prev => [
      {
        id: newId,
        name: "Novo Projeto",
        objective: "Definir objetivo",
        startMonth: 1,
        durationMonths: 6,
        teamIds: [],
        allocations: {}
      },
      ...prev
    ]);
  };

  const handleRemoveProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleMemberInProject = (projectId: number, memberId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const isMember = p.teamIds.includes(memberId);
      if (isMember) {
        // Remove: Filter ID and delete allocation key to keep state clean
        const newIds = p.teamIds.filter(id => id !== memberId);
        const newAllocations = { ...p.allocations };
        delete newAllocations[memberId];
        return { ...p, teamIds: newIds, allocations: newAllocations };
      } else {
        // Add: Append ID and initialize allocation to 0
        return { 
            ...p, 
            teamIds: [...p.teamIds, memberId],
            allocations: { ...p.allocations, [memberId]: 0 } 
        };
      }
    }));
  };

  // --- TEAM ACTIONS ---

  const handleUpdateMember = (memberId: string, field: keyof TeamMember, value: any) => {
    setTeam(prev => prev.map(m => m.id === memberId ? { ...m, [field]: value } : m));
  };

  const handleUpdateMemberCost = (memberId: string, monthIndex: number, value: number) => {
    setTeam(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const newCosts = [...m.monthlyCost];
      newCosts[monthIndex] = value;
      return { ...m, monthlyCost: newCosts };
    }));
  };

  const handleAddMember = () => {
    const id = `member-${Date.now()}`;
    setTeam(prev => [...prev, {
      id,
      name: "Novo Membro",
      role: "Cargo",
      monthlyCost: Array(12).fill(0)
    }]);
  };

  const handleRemoveMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    // Also remove from projects
    setProjects(prev => prev.map(p => ({
      ...p,
      teamIds: p.teamIds.filter(tid => tid !== id),
      allocations: Object.fromEntries(Object.entries(p.allocations).filter(([k]) => k !== id))
    })));
  };


  // Recalculate financials
  const { monthlyData, projectCosts, totalProjectedCost, monthlyOverload } = useMemo(() => {
    return calculateFinancials(projects, team, TOTAL_BUDGET_2026);
  }, [projects, team]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-lg shrink-0">
        <div className="p-6 border-b border-slate-700">
           <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <Wallet className="text-emerald-400" />
             <span>Orça<span className="text-emerald-400">X</span> 2026</span>
           </div>
           <p className="text-xs text-slate-400 mt-2">Gestão de Dedicação e Investimentos</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'dashboard' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard Financeiro
          </button>
          
          <button 
            onClick={() => setActiveTab('allocation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'allocation' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Calculator className="w-5 h-5" />
            Projetos e Alocação
          </button>

          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'team' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Users className="w-5 h-5" />
            Gestão do Time
          </button>
        </nav>

        <div className="p-6 border-t border-slate-700">
           <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Resumo Rápido</h4>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-white">{(totalProjectedCost/TOTAL_BUDGET_2026 * 100).toFixed(0)}%</span>
                <span className="text-xs text-slate-400 mb-1">do orçamento</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                 <div 
                  className={`h-1.5 rounded-full ${totalProjectedCost > TOTAL_BUDGET_2026 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min((totalProjectedCost/TOTAL_BUDGET_2026 * 100), 100)}%`}}
                 ></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex justify-between items-center shadow-sm">
           <div>
             <h1 className="text-2xl font-bold text-slate-800">
               {activeTab === 'dashboard' && 'Visão Geral do Orçamento'}
               {activeTab === 'allocation' && 'Projetos e Matriz de Esforço'}
               {activeTab === 'team' && 'Gestão de Pessoas e Salários'}
             </h1>
             <p className="text-sm text-slate-500">
               {activeTab === 'dashboard' && 'Acompanhamento do consumo de recursos humanos vs orçamento previsto.'}
               {activeTab === 'allocation' && 'Edite projetos e distribua a dedicação do time. Cuidado com conflitos.'}
               {activeTab === 'team' && 'Cadastre os integrantes e seus investimentos mensais variáveis.'}
             </p>
           </div>
           
           <div className="flex items-center gap-4">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
                
                {saveStatus === 'idle' && persistenceMode === 'cloud' && (
                    <span className="text-slate-400 flex items-center gap-1"><Cloud className="w-3 h-3" /> Online (MongoDB)</span>
                )}
                {saveStatus === 'idle' && persistenceMode !== 'cloud' && (
                    <span className="text-orange-400 flex items-center gap-1"><Database className="w-3 h-3" /> Offline (Local)</span>
                )}

                {saveStatus === 'saving' && <span className="text-indigo-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</span>}
                
                {saveStatus === 'saved' && persistenceMode === 'cloud' && (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Salvo (Cloud)</span>
                )}
                 {saveStatus === 'saved' && persistenceMode !== 'cloud' && (
                    <span className="text-orange-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Salvo (Local)</span>
                )}

                {saveStatus === 'error' && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Erro ao salvar</span>}
              </div>

              <div className="text-right hidden sm:block">
                <span className="block text-xs text-slate-400">Total Projetado</span>
                <span className="block font-bold text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProjectedCost)}
                </span>
              </div>
           </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">
          {activeTab === 'dashboard' && (
            <FinancialDashboard 
              projects={projects}
              team={team}
              monthlyData={monthlyData}
              projectCosts={projectCosts}
              totalBudget={TOTAL_BUDGET_2026}
              totalProjectedCost={totalProjectedCost}
            />
          )}

          {activeTab === 'allocation' && (
            <AllocationTable 
              projects={projects}
              team={team}
              onUpdateAllocation={handleUpdateAllocation}
              onUpdateProjectDetails={handleUpdateProjectDetails}
              onAddProject={handleAddProject}
              onRemoveProject={handleRemoveProject}
              onToggleMember={handleToggleMemberInProject}
              monthlyOverload={monthlyOverload}
            />
          )}

          {activeTab === 'team' && (
            <TeamManagement 
              team={team} 
              onUpdateMember={handleUpdateMember}
              onUpdateCost={handleUpdateMemberCost}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;