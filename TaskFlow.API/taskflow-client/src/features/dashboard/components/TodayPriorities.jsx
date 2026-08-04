import TaskItem from "@/features/tasks/components/TaskItem";
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
    .slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-md h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-sm">
            Today's Priorities
          </h3>
        </div>
        <div className="p-xl bg-surface-container-lowest rounded-2xl apple-shadow border border-outline-variant/10 flex flex-col items-center justify-center min-h-[200px]">
          <Spinner size="md" />
          <p className="text-body-sm text-on-surface-variant mt-sm">Loading priorities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-sm">
          Today's Priorities
          <span className="bg-surface-container-high text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
            {displayedTasks.length}
          </span>
        </h3>
        <button type="button" onClick={onViewAll} className="text-primary font-label-md text-xs font-bold hover:underline cursor-pointer">
          View All &rarr;
        </button>
      </div>

      <div className="space-y-sm flex-1">
        {displayedTasks.length === 0 ? (
          <div className="p-xl bg-surface-container-lowest rounded-2xl apple-shadow border border-outline-variant/10 text-center text-on-surface-variant text-xs">
            No priority tasks found for today. Great job clearing your queue!
          </div>
        ) : (
          displayedTasks.map((task) => (
            <TaskItem
              key={task.id}
              title={task.title}
              description={task.description}
              teamName={task.teamName || "Backend Team"}
              priority={task.priority}
              dueDate={task.dueDate}
            />
          ))
        )}
      </div>
    </div>
  );
}