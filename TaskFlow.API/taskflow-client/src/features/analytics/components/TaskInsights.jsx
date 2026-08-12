import { useMemo } from "react";
import Card from "@/components/ui/Card";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { TASK_PRIORITY } from "@/constants/tasks.constants";

export default function TaskInsights() {
  const tasks = useAnalyticsTasks();

  const insights = useMemo(() => {
    // We only consider active (uncompleted) tasks for these insights where appropriate
    const activeTasks = tasks.filter(t => !t.isCompleted);

    // 1. HIGH PRIORITY
    const highPriorityTasks = activeTasks.filter(
      t => t.priority === TASK_PRIORITY.HIGH || t.priority === TASK_PRIORITY.URGENT
    ).length;

    // 2. DUE SOON (within 3 days)
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const dueSoonTasks = activeTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate > now && dueDate <= threeDaysFromNow;
    }).length;

    // 3. AVERAGE PROGRESS
    let totalProgress = 0;
    activeTasks.forEach(t => {
      totalProgress += t.progress || 0;
    });
    const avgProgress = activeTasks.length > 0 ? Math.round(totalProgress / activeTasks.length) : 0;

    // 4. ACTIVE DISCUSSION
    const activeDiscussionTasks = activeTasks.filter(t => (t.commentsCount || 0) > 0).length;
    const discussionRatio = activeTasks.length > 0 ? Math.round((activeDiscussionTasks / activeTasks.length) * 100) : 0;

    return [
      {
        label: "High Priority",
        value: highPriorityTasks,
        subtitle: "tasks need attention",
        icon: "priority_high",
        colorClass: "text-error",
        bgClass: "bg-error/10",
        borderClass: "border-error/20"
      },
      {
        label: "Due Soon",
        value: dueSoonTasks,
        subtitle: "within 3 days",
        icon: "schedule",
        colorClass: "text-orange-500",
        bgClass: "bg-orange-500/10",
        borderClass: "border-orange-500/20"
      },
      {
        label: "Average Progress",
        value: `${avgProgress}%`,
        subtitle: "of active tasks",
        icon: "moving",
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20"
      },
      {
        label: "Active Discussion",
        value: activeDiscussionTasks,
        subtitle: `${discussionRatio}% of active tasks`,
        icon: "forum",
        colorClass: "text-secondary",
        bgClass: "bg-secondary/10",
        borderClass: "border-secondary/20"
      }
    ];
  }, [tasks]);

  return (
    <Card variant="default" className="col-span-12 md:col-span-12 lg:col-span-4 h-full">
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500 text-[22px]">
            insights
          </span>
          Task Health
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {insights.map((item) => (
          <div 
            key={item.label} 
            className={`rounded-xl p-3 border ${item.borderClass} ${item.bgClass}`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`material-symbols-outlined text-[16px] ${item.colorClass}`}>
                {item.icon}
              </span>
              <span className="text-[11px] text-on-surface-variant block uppercase font-bold truncate">
                {item.label}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-extrabold text-on-surface">
                {item.value || "0"}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {item.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
