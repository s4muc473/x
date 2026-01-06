import { Project, TeamMember, Month } from '../types';

export const calculateFinancials = (projects: Project[], team: TeamMember[], totalBudget: number) => {
  
  // 1. Calculate Monthly Costs per Project
  // Array of 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0 = Jan
    const monthNum = i + 1;
    
    let monthTotalCost = 0;
    const projectBreakdown: Record<number, number> = {}; // projectId -> cost this month
    const memberAllocations: Record<string, number> = {}; // memberId -> total % this month

    // Initialize allocations for this month
    team.forEach(m => memberAllocations[m.id] = 0);

    projects.forEach(project => {
      // Check if project is active this month
      const start = project.startMonth;
      const end = start + project.durationMonths - 1;
      
      // Handle year wrap for logic if needed (though prompt is 2026 specific)
      // Assuming straightforward 1-12 range for this specific 2026 budget
      const isActive = monthNum >= start && monthNum <= end;

      if (isActive) {
        let projectMonthlyCost = 0;
        
        project.teamIds.forEach(memberId => {
          const member = team.find(t => t.id === memberId);
          if (member) {
            const allocationPct = project.allocations[memberId] || 0;
            const cost = member.monthlyCost[monthIndex]; // Get cost specific to this month (Jan vs Mar changes)
            
            // Cost for this project = Member Cost * (% Allocation / 100)
            const allocatedCost = cost * (allocationPct / 100);
            
            projectMonthlyCost += allocatedCost;
            
            // Track total allocation for member to detect overload
            memberAllocations[memberId] += allocationPct;
          }
        });
        
        projectBreakdown[project.id] = projectMonthlyCost;
        monthTotalCost += projectMonthlyCost;
      }
    });

    return {
      name: Month[monthNum].substring(0, 3),
      monthIndex: monthNum,
      totalCost: monthTotalCost,
      budgetLimit: totalBudget / 12, // Linear distribution for reference
      projectBreakdown,
      memberAllocations
    };
  });

  // 2. Aggregate Totals
  const totalProjectedCost = monthlyData.reduce((acc, m) => acc + m.totalCost, 0);
  
  // 3. Project Totals
  const projectCosts = projects.map(p => {
    const cost = monthlyData.reduce((acc, m) => acc + (m.projectBreakdown[p.id] || 0), 0);
    return {
      id: p.id,
      name: p.name,
      cost,
      percentage: totalProjectedCost > 0 ? (cost / totalProjectedCost) * 100 : 0
    };
  }).sort((a, b) => b.cost - a.cost);

  // 4. Analyze Overloads
  const monthlyOverload: Record<string, number[]> = {};
  team.forEach(m => {
    monthlyOverload[m.id] = monthlyData.map(d => d.memberAllocations[m.id] || 0);
  });

  return {
    monthlyData,
    projectCosts,
    totalProjectedCost,
    monthlyOverload
  };
};