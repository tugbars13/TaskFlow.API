import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function TodayScheduleCard({
  selectedDateText = "Today",
  tasks = [],
  onTaskClick,
}) {
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge variant="danger">High</Badge>;

      case "medium":
        return <Badge variant="warning">Medium</Badge>;

      default:
        return <Badge variant="success">Low</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl p-4 apple-shadow space-y-3">
      {/* Header aligned perfectly */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 h-6">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">
            today
          </span>
          Schedule: {selectedDateText}
        </h3>
        <span className="bg-primary/10 text-primary dark:text-primary text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center justify-center">
          {tasks.length} {tasks.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* List items or Empty State */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-on-surface-variant font-medium">
              No tasks scheduled today
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const timeStr = task.dueDate
              ? new Date(task.dueDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "09:00";

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-center shrink-0 min-w-[44px]">
                    <span className="text-[11px] font-bold text-primary dark:text-primary block">
                      {timeStr}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[14px]">
                      event
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <h4
                      className={`text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors ${task.isCompleted ? "line-through opacity-60" : ""}`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant/80 truncate">
                      {task.category || "General"} •{" "}
                      {task.description ?? "Milestone"}
                    </p>
                  </div>
                </div>

                {getPriorityBadge(task.priority)}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
