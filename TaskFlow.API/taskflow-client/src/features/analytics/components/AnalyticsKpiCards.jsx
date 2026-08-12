import { useMemo } from "react";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { calculateTaskStatus } from "@/features/analytics/utils/taskStatus.utils";
import { TASK_STATUS_VALUE } from "@/constants/taskStatusConstants";
import Card from "@/components/ui/Card";

export default function AnalyticsKpiCards() {
  const activeTasks = useAnalyticsTasks();

  const kpis = useMemo(() => {
    const totalTasks = activeTasks.length;
    
    // Status breakdown using the same util as other components
    const { completed } = calculateTaskStatus(activeTasks);
    
    // Completion Rate
    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    
    // Overdue Tasks: due date has passed, not completed, and due date is valid
    const now = new Date();
    const overdueTasks = activeTasks.filter(t => {
      const isReallyCompleted = t.isCompleted || (t.status && TASK_STATUS_VALUE.COMPLETED.includes(t.status));
      if (isReallyCompleted || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now;
    }).length;

    return [
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: "fact_check",
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        title: "Completed",
        value: completed,
        icon: "task_alt",
        color: "text-status-progress",
        bg: "bg-status-progress/10",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        icon: "trending_up",
        color: "text-status-progress",
        bg: "bg-status-progress/10",
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks,
        icon: "warning",
        color: "text-status-error",
        bg: "bg-status-error/10",
      }
    ];
  }, [activeTasks]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} padding="md" variant="filled" className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
            <span className="material-symbols-outlined text-[24px]">
              {kpi.icon}
            </span>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wide">
              {kpi.title}
            </h4>
            <div className="text-[28px] font-bold text-on-surface leading-tight mt-1">
              {kpi.value}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
