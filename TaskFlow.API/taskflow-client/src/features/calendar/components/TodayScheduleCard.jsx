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
    <Card className="rounded-3xl p-6 apple-shadow space-y-5">
      {/* Header aligned perfectly */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-500 text-[22px]">
            today
          </span>
          Schedule: {selectedDateText}
        </h3>
        <span className="bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center justify-center">
          {tasks.length} {tasks.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* List items or Empty State */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-8 px-6 text-center bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant/20 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[26px]">
                event_available
              </span>
            </div>
            <h4 className="text-xs font-bold text-on-surface">
              No events scheduled
            </h4>
            <p className="text-[11px] text-on-surface-variant max-w-[250px] mx-auto leading-relaxed whitespace-normal break-words">
              Your schedule is clear for this date. Select another day from the
              calendar or create a new task to get started.
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
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:border-purple-500/30 apple-shadow transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-center shrink-0 min-w-[44px]">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                      {timeStr}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      event
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <h4
                      className={`text-xs font-semibold text-on-surface truncate group-hover:text-purple-500 transition-colors ${task.isCompleted ? "line-through opacity-60" : ""}`}
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
