import React from 'react';
import { Project, TeamMember, Month } from '../types';
import { Users, AlertCircle, Trash2, Plus, Calendar, UserPlus, X } from 'lucide-react';

interface AllocationTableProps {
  projects: Project[];
  team: TeamMember[];
  onUpdateAllocation: (projectId: number, memberId: string, value: number) => void;
  onUpdateProjectDetails: (projectId: number, field: keyof Project, value: any) => void;
  onAddProject: () => void;
  onRemoveProject: (id: number) => void;
  onToggleMember: (projectId: number, memberId: string) => void;
  monthlyOverload: Record<string, number[]>;
}

const AllocationTable: React.FC<AllocationTableProps> = ({ 
  projects, 
  team, 
  onUpdateAllocation, 
  onUpdateProjectDetails,
  onAddProject,
  onRemoveProject,
  onToggleMember,
  monthlyOverload 
}) => {
  
  const getMonthName = (m: number) => Month[m];

  // Helper to identify specific months where a conflict occurs for a member within a project's timeframe
  const getConflictingMonths = (projectId: number, memberId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];

    const start = project.startMonth;
    const end = start + project.durationMonths - 1;
    const overloadData = monthlyOverload[memberId];

    if (!overloadData) return [];

    const conflictingMonths: string[] = [];
    // Check months where index+1 matches the timeframe
    for (let i = 0; i < 12; i++) {
        const monthNum = i + 1;
        if (monthNum >= start && monthNum <= end) {
            if (overloadData[i] > 100) {
                conflictingMonths.push(getMonthName(monthNum).substring(0, 3));
            }
        }
    }
    return conflictingMonths;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Matriz de Dedicação e Cronograma
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie a equipe clicando nas células.
            <span className="ml-1 text-slate-400">Célula vazia = Fora do projeto. Célula preenchida = Alocado.</span>
          </p>
        </div>
        <button 
          onClick={onAddProject}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
              <th className="p-4 border-b font-semibold sticky left-0 bg-slate-100 z-10 w-12 shadow-sm text-center">#</th>
              <th className="p-4 border-b font-semibold sticky left-12 bg-slate-100 z-10 w-56 shadow-sm">Projeto</th>
              <th className="p-4 border-b font-semibold w-32">Config. Tempo</th>
              <th className="p-4 border-b font-semibold w-48 text-center">Cronograma (Jan-Dez)</th>
              {team.map(member => (
                <th key={member.id} className="p-4 border-b font-semibold text-center min-w-[100px]">
                  <div className="flex flex-col">
                    <span>{member.name}</span>
                    <span className="text-[10px] text-slate-400 normal-case">{member.role}</span>
                  </div>
                </th>
              ))}
              <th className="p-4 border-b font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {projects.map((project, idx) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 text-center text-slate-400 font-mono sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100">{idx + 1}</td>
                <td className="p-2 sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-100 align-top">
                  <input 
                    type="text" 
                    value={project.name} 
                    onChange={(e) => onUpdateProjectDetails(project.id, 'name', e.target.value)}
                    className="w-full font-medium text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all"
                  />
                  <div className="text-[10px] text-slate-400 px-2 mt-1">
                      Objetivo: 
                      <input 
                        type="text" 
                        value={project.objective}
                        onChange={(e) => onUpdateProjectDetails(project.id, 'objective', e.target.value)}
                        className="ml-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none w-32" 
                      />
                  </div>
                </td>
                
                {/* Time Configuration Column */}
                <td className="p-2 align-top">
                    <div className="flex flex-col gap-2">
                         <div className="relative">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Início:</span>
                            <div className="relative">
                                <select 
                                    value={project.startMonth}
                                    onChange={(e) => onUpdateProjectDetails(project.id, 'startMonth', parseInt(e.target.value))}
                                    className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none cursor-pointer text-slate-600 text-xs pr-6"
                                >
                                    {Object.values(Month).filter(v => typeof v === 'number').map(m => (
                                        <option key={m} value={m}>{getMonthName(m as number)}</option>
                                    ))}
                                </select>
                                <Calendar className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Duração (Meses):</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="12"
                                value={project.durationMonths}
                                onChange={(e) => onUpdateProjectDetails(project.id, 'durationMonths', parseInt(e.target.value))}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none text-slate-600 text-xs"
                            />
                        </div>
                   </div>
                </td>

                {/* Visual Timeline Column */}
                <td className="p-2 text-center align-middle">
                    <div className="flex gap-1 justify-center">
                        {Array.from({length: 12}, (_, i) => {
                            const monthNum = i + 1;
                            const isActive = monthNum >= project.startMonth && monthNum < (project.startMonth + project.durationMonths);
                            return (
                                <div 
                                    key={i} 
                                    title={getMonthName(monthNum)}
                                    className={`w-2 h-6 rounded-sm transition-all ${isActive ? 'bg-indigo-500' : 'bg-slate-200 opacity-40'}`}
                                ></div>
                            )
                        })}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 flex justify-between px-4">
                        <span>Jan</span>
                        <span>Dez</span>
                    </div>
                </td>

                {/* Team Allocation Columns - THE MATRIX INTERACTION */}
                {team.map(member => {
                  const isAssigned = project.teamIds.includes(member.id);
                  const allocation = project.allocations[member.id] || 0;
                  
                  // New conflict logic: get specific months
                  const conflictingMonths = isAssigned ? getConflictingMonths(project.id, member.id) : [];
                  const isConflict = conflictingMonths.length > 0;
                  
                  return (
                    <td key={member.id} className="p-2 text-center relative group/cell align-middle h-full">
                      {isAssigned ? (
                        <div className="relative flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={allocation === 0 ? '' : allocation} // If 0, show empty for easy typing
                            placeholder="0"
                            onFocus={(e) => e.target.select()} // Auto-select on focus
                            onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                onUpdateAllocation(project.id, member.id, val);
                            }}
                            className={`w-16 text-center border rounded-md py-1.5 px-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-semibold shadow-sm
                              ${isConflict ? 'bg-red-50 border-red-300 text-red-600 ring-red-200' : 
                                allocation > 0 ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500'}
                            `}
                          />
                          <span className="ml-0.5 text-[10px] text-slate-400 absolute right-3 pointer-events-none">%</span>
                          
                          {/* Remove Button (Visible on Hover) */}
                          <button 
                            onClick={() => onToggleMember(project.id, member.id)}
                            className="absolute -top-2 -right-1 w-5 h-5 bg-white border border-red-200 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 opacity-0 group-hover/cell:opacity-100 shadow-md transition-all z-20"
                            title={`Remover ${member.name} deste projeto`}
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {isConflict && (
                              <div className="absolute -top-3 -left-1 z-10 group/tooltip cursor-help">
                                <AlertCircle className="w-4 h-4 text-red-500 bg-white rounded-full shadow-sm" />
                                <div className="hidden group-hover/tooltip:block absolute bottom-5 left-0 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-50">
                                    <div className="font-bold text-red-200 mb-1">Sobrecarga ({conflictingMonths.length} meses)</div>
                                    <div className="flex gap-1">
                                        {conflictingMonths.map(m => (
                                            <span key={m} className="bg-red-600 px-1 rounded">{m}</span>
                                        ))}
                                    </div>
                                </div>
                              </div>
                          )}
                        </div>
                      ) : (
                        // Add Button (Visual Slot)
                        <div className="flex justify-center h-8">
                            <button 
                                onClick={() => onToggleMember(project.id, member.id)}
                                className="w-16 h-8 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-300 hover:bg-emerald-50 transition-all group/add"
                                title={`Adicionar ${member.name} ao projeto`}
                            >
                                <Plus className="w-4 h-4 opacity-50 group-hover/add:opacity-100" />
                            </button>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="p-4 text-center align-middle">
                    <button 
                        onClick={() => onRemoveProject(project.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                        title="Excluir Projeto"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warnings Section */}
      <div className="p-4 bg-orange-50 border-t border-orange-100">
         <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            Resumo de Sobrecarga (Alocação  100%)
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(monthlyOverload).map(([memberId, monthAllocations]) => {
               const allocations = monthAllocations as number[];
               const overloadedMonths = allocations
                .map((total, idx) => ({ month: idx + 1, total }))
                .filter(m => m.total > 100);
                
               if (overloadedMonths.length === 0) return null;

               const memberName = team.find(t => t.id === memberId)?.name;
               
               return (
                 <div key={memberId} className="text-xs bg-white p-2 rounded border border-red-200 text-red-700 shadow-sm flex flex-col">
                    <strong>{memberName}</strong> 
                    <span className="text-[10px] text-red-500 mt-1">
                        {overloadedMonths.map(m => `${getMonthName(m.month).substring(0,3)}:${m.total.toFixed(0)}%`).join(', ')}
                    </span>
                 </div>
               );
            })}
         </div>
         {Object.values(monthlyOverload).every((arr: number[]) => arr.every(v => v <= 100)) && (
           <p className="text-xs text-green-600 font-medium">Nenhum conflito de agenda detectado. Todo o time está dentro da capacidade.</p>
         )}
      </div>
    </div>
  );
};

export default AllocationTable;