import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import useTasks from "@/features/tasks/hooks/useTasks";

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

function TaskItemRow({ task, onTaskClick }) {
  const { tasks: allTasks } = useTasks();
  const [expanded, setExpanded] = useState(false);

  // Find subtasks for this task
  const subtasks = allTasks.filter((t) => t.parentTaskId && t.parentTaskId == task.id);
  const hasSubtasks = subtasks.length > 0;

  const timeStr = task.dueDate
    ? new Date(task.dueDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "09:00";

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 shadow-sm transition-all cursor-pointer group"
      >
        <div 
          className="flex items-center gap-3 min-w-0 flex-1"
          onClick={() => onTaskClick?.(task)}
        >
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

        <div className="flex items-center gap-2 shrink-0">
          {getPriorityBadge(task.priority)}
          {hasSubtasks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 rounded-md hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">
                {expanded ? "expand_less" : "expand_more"}
              </span>
            </button>
          )}
        </div>
      </div>

      {expanded && hasSubtasks && (
        <div className="mt-2 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col gap-3 relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/50">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-500 text-[18px]">
                auto_awesome
              </span>
              <span className="text-xs font-bold text-rose-700">
                AI ile oluşturulan alt görevler
              </span>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
              {subtasks.length} görev
            </span>
          </div>

          {/* Subtasks List */}
          <div className="relative flex flex-col gap-2">
            {/* Dikey bağlantı çizgisi */}
            <div className="absolute left-[25px] top-4 bottom-4 w-[2px] bg-rose-200/60 rounded-full" />

            {subtasks.map((subtask, index) => (
              <div
                key={subtask.id}
                className="relative z-10 flex items-start gap-3 bg-white p-2.5 rounded-xl border border-rose-100/50 shadow-sm hover:border-rose-300 transition-all cursor-pointer group"
                onClick={() => onTaskClick?.(subtask)}
              >
                {/* Numara Dairesi */}
                <div className="w-[30px] h-[30px] shrink-0 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[13px] font-bold shadow-sm">
                  {index + 1}
                </div>

                {/* Başlık ve Açıklama */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <h5
                    className={`text-xs font-bold text-on-surface group-hover:text-primary transition-colors ${
                      subtask.isCompleted ? "line-through opacity-60" : ""
                    }`}
                  >
                    {subtask.title}
                  </h5>
                  {subtask.description && (
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                      {subtask.description}
                    </p>
                  )}
                </div>

                {/* Checkbox */}
                <div className="shrink-0 pt-1 flex items-center justify-center">
                  <div
                    className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors border ${
                      subtask.isCompleted
                        ? "bg-primary border-primary"
                        : "border-outline-variant/50 group-hover:border-primary/50"
                    }`}
                  >
                    {subtask.isCompleted && (
                      <span className="material-symbols-outlined text-white text-[14px]">
                        check
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TodayScheduleCard({
  selectedDateText = "Today",
  tasks = [],
  onTaskClick,
}) {
  // Only show top-level tasks (or tasks whose parents are not in this list)
  // This prevents subtasks from appearing twice (once as parent's child, once on its own)
  const topLevelTasks = tasks.filter(t => !t.parentTaskId || !tasks.find(parent => parent.id === t.parentTaskId));

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
          {topLevelTasks.length} {topLevelTasks.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* List items or Empty State */}
      <div className="space-y-3">
        {topLevelTasks.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-on-surface-variant font-medium">
              No tasks scheduled today
            </p>
          </div>
        ) : (
          topLevelTasks.map((task) => (
            <TaskItemRow 
              key={task.id} 
              task={task} 
              onTaskClick={onTaskClick} 
            />
          ))
        )}
      </div>
    </Card>
  );
}
