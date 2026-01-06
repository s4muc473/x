import React from 'react';
import { TeamMember, Month } from '../types';
import { Users, Plus, Trash2, DollarSign, Copy } from 'lucide-react';

interface TeamManagementProps {
  team: TeamMember[];
  onUpdateMember: (id: string, field: keyof TeamMember, value: any) => void;
  onUpdateCost: (id: string, monthIndex: number, value: number) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ 
  team, 
  onUpdateMember, 
  onUpdateCost, 
  onAddMember, 
  onRemoveMember 
}) => {

  const getMonthName = (m: number) => Month[m];

  // Helper to copy Jan value to all months
  const replicateJanValue = (memberId: string, value: number) => {
    for (let i = 0; i < 12; i++) {
        onUpdateCost(memberId, i, value);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Gestão do Time e Salários
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre os integrantes e ajuste o investimento mensal (Salário + Encargos/Impostos). 
            Dê um clique duplo no valor de Janeiro para replicar para o ano todo.
          </p>
        </div>
        <button 
          onClick={onAddMember}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
              <th className="p-4 border-b font-semibold w-48 sticky left-0 bg-slate-100 z-10">Nome</th>
              <th className="p-4 border-b font-semibold w-32">Cargo/Tipo</th>
              {Array.from({ length: 12 }, (_, i) => (
                <th key={i} className="p-2 border-b font-semibold text-center min-w-[100px] text-[10px]">
                  {getMonthName(i + 1).substring(0, 3)}
                </th>
              ))}
              <th className="p-4 border-b font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 sticky left-0 bg-white border-r border-slate-100">
                  <input 
                    type="text" 
                    value={member.name}
                    onChange={(e) => onUpdateMember(member.id, 'name', e.target.value)}
                    className="w-full font-medium text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all"
                    placeholder="Nome"
                  />
                </td>
                <td className="p-4">
                  <input 
                    type="text" 
                    value={member.role}
                    onChange={(e) => onUpdateMember(member.id, 'role', e.target.value)}
                    className="w-full text-slate-500 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all text-xs"
                    placeholder="Cargo"
                  />
                </td>
                {member.monthlyCost.map((cost, idx) => (
                  <td key={idx} className="p-2">
                    <div className="relative group/input">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                        <input 
                            type="number" 
                            value={cost === 0 ? '' : cost} // Display empty if 0
                            placeholder="0.00"
                            onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                onUpdateCost(member.id, idx, val);
                            }}
                            onFocus={(e) => e.target.select()} // Auto-select text on focus
                            onDoubleClick={() => idx === 0 && replicateJanValue(member.id, cost)}
                            title={idx === 0 ? "Clique duplo para copiar para todos os meses" : ""}
                            className="w-full pl-6 pr-1 py-1 text-right text-slate-700 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                        />
                         {idx === 0 && (
                            <div className="hidden group-hover/input:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                                Double-click p/ replicar
                            </div>
                        )}
                    </div>
                  </td>
                ))}
                <td className="p-4 text-center">
                    <button 
                        onClick={() => onRemoveMember(member.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remover Membro"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamManagement;