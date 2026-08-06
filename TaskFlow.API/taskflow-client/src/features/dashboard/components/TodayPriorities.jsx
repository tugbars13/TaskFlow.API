import DashboardTaskRow from "@/features/tasks/components/DashboardTaskRow";
import Spinner from "@/components/ui/Spinner";

export default function TodayPriorities({
  tasks = [],
  loading = false,
  onViewAll,
}) {
  const displayedTasks = (tasks || [])
    .slice()
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      return 0;
    })
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-sm">
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-xs">
            Today's Priorities
          </h3>
        </div>
        <div className="py-xl flex flex-col items-center justify-center min-h-[200px]" aria-busy="true" aria-live="polite">
          <Spinner size="md" />
          <p className="text-body-sm text-on-surface-variant mt-sm">Loading priorities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-sm">
        <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-xs">
          Today's Priorities
          <span className="bg-surface-container-high text-on-surface-variant px-sm py-0.5 rounded-full text-label-sm font-medium">
            {displayedTasks.length}
          </span>
        </h3>
        <button type="button" onClick={onViewAll} className="text-on-surface-variant font-medium text-label-sm hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm">
          View All
        </button>
      </div>

      <div className="flex-1 border-t border-outline-variant/10 divide-y divide-outline-variant/10">
        {displayedTasks.length === 0 ? (
          <div className="py-xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-outline mb-sm text-[24px]">inventory_2</span>
            <h4 className="text-body-lg font-medium text-on-surface mb-xs">No priorities today</h4>
            <p className="text-body-sm text-on-surface-variant">Everything scheduled for today is complete.</p>
          </div>
        ) : (
          displayedTasks.map((task) => (
            <DashboardTaskRow
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              teamName={task.teamName}
              priority={task.priority}
              dueDate={task.dueDate}
              assignee={task.assignee}
            />
          ))
        )}
      </div>
    </div>
  );
}