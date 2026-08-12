import { useMemo } from "react";
import Card from "@/components/ui/Card";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { TASK_PRIORITY } from "@/constants/tasks.constants";
import { TASK_STATUS_VALUE } from "@/constants/taskStatusConstants";

export default function SmartInsights() {
  const tasks = useAnalyticsTasks();

  const insights = useMemo(() => {
    const activeTasks = tasks.filter(
      (t) => !(t.isCompleted || (t.status && TASK_STATUS_VALUE.COMPLETED.includes(t.status)))
    );

    if (tasks.length === 0) {
      return [
        {
          title: "NO TASK ACTIVITY YET",
          message: "Create your first tasks to start receiving workspace insights.",
          icon: "lightbulb",
          colorClass: "text-amber-300",
        },
      ];
    }

    const generatedInsights = [];

    // 1. OVERDUE
    const now = new Date();
    const overdueTasks = activeTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now;
    }).length;

    if (overdueTasks > 0) {
      generatedInsights.push({
        title: "Overdue tasks need attention",
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}. Consider clearing them first.`,
        icon: "warning",
        colorClass: "text-red-400",
      });
    }

    // 2. DUE SOON
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const dueSoonTasks = activeTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= threeDaysFromNow;
    }).length;

    if (overdueTasks === 0 && dueSoonTasks > 0) {
      generatedInsights.push({
        title: "Deadlines approaching",
        message: `${dueSoonTasks} task${dueSoonTasks > 1 ? "s are" : " is"} due within the next 3 days. Review them before they become overdue.`,
        icon: "schedule",
        colorClass: "text-orange-300",
      });
    }

    // 3. HIGH PRIORITY
    const highPriorityTasks = activeTasks.filter(
      (t) => t.priority === TASK_PRIORITY.HIGH || t.priority === TASK_PRIORITY.URGENT
    ).length;

    if (overdueTasks === 0 && dueSoonTasks === 0 && highPriorityTasks > 0) {
      generatedInsights.push({
        title: "High-priority work",
        message: `You have ${highPriorityTasks} high-priority task${highPriorityTasks > 1 ? "s" : ""} waiting for attention.`,
        icon: "priority_high",
        colorClass: "text-rose-400",
      });
    }

    // 4. LOW PROGRESS
    let totalProgress = 0;
    activeTasks.forEach((t) => {
      totalProgress += t.progress || 0;
    });
    const avgProgress = activeTasks.length > 0 ? Math.round(totalProgress / activeTasks.length) : 0;

    if (overdueTasks === 0 && dueSoonTasks === 0 && highPriorityTasks === 0 && activeTasks.length > 0 && avgProgress < 30) {
      generatedInsights.push({
        title: "Progress needs a push",
        message: `Your active tasks are currently at ${avgProgress}% average progress.`,
        icon: "moving",
        colorClass: "text-primary",
      });
    }

    // 5. ACTIVE DISCUSSION
    const activeDiscussionTasks = activeTasks.filter((t) => (t.commentsCount || 0) > 0).length;

    if (overdueTasks === 0 && dueSoonTasks === 0 && highPriorityTasks === 0 && (activeTasks.length === 0 || avgProgress >= 30) && activeDiscussionTasks > 0) {
      generatedInsights.push({
        title: "Active discussions",
        message: `${activeDiscussionTasks} task${activeDiscussionTasks > 1 ? "s" : ""} currently have active discussions.`,
        icon: "forum",
        colorClass: "text-emerald-300",
      });
    }

    // 6. POSITIVE STATE
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        title: "Workspace looks good",
        message: "Your tasks are currently under control. Keep up the momentum.",
        icon: "check_circle",
        colorClass: "text-primary-300", // or similar matching the dark card
      });
    }

    return generatedInsights.slice(0, 2); // Return at most 2 insights
  }, [tasks]);

  return (
    <Card
      variant="filled"
      className="col-span-12 lg:col-span-4 bg-primary text-on-primary flex flex-col relative overflow-hidden group min-h-[400px]"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
          <span className="material-symbols-outlined text-[22px] text-white">
            tips_and_updates
          </span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-white leading-none">
            Smart Insights
          </h3>
          <p className="text-[11px] text-white/70 mt-1">Data-driven workspace analysis</p>
        </div>
      </div>

      {/* Dynamic Insights List */}
      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span className={`material-symbols-outlined text-[16px] ${insight.colorClass}`}>
                {insight.icon}
              </span>
              {insight.title}
            </span>
            <p className="text-sm font-medium text-white/90 leading-snug">
              {insight.message}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
