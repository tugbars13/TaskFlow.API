import { useRef } from "react";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";
import { stripHtml } from "@/features/myspace/utils/sanitizeHtml";
const PRIORITY_BORDER = {
  high: "border-l-[4px] border-l-primary",
  3: "border-l-[4px] border-l-primary",
  low: "border-l-[4px] border-l-gray-400 dark:border-l-gray-500",
  1: "border-l-[4px] border-l-gray-400 dark:border-l-gray-500",
  medium: "border-l-[4px] border-l-amber-500 dark:border-l-amber-400",
  2: "border-l-[4px] border-l-amber-500 dark:border-l-amber-400",
};
const DEFAULT_DESCRIPTION =
  "Finalize feature implementation and design token alignment.";
export const getPriorityBorderClass = (priority) =>
  PRIORITY_BORDER[String(priority ?? "").toLowerCase()] ??
  PRIORITY_BORDER.medium;

export default function TaskCard({
  task,
  draggable = false,
  onDragStart,
  onClick,
  onDoubleClick,
  showAssignee = true,
  showTeam = false,
}) {
  const lastClickTime = useRef(0);
  const formattedDueDate = task.dueDate
    ? formatDateDDMMYYYY(task.dueDate)
    : "—";
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDoubleClick={(event) => {
        console.log("DOUBLE CLICK WORKS", task.id);
        onDoubleClick?.(event);
      }}
      className={`group bg-surface-container-low border border-outline-variant/10 rounded-xl p-3 apple-shadow cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 flex flex-col gap-2 ${getPriorityBorderClass(
        task.priority,
      )}`}
    >
      <div className="flex flex-col">
        <h4
          className={`text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 ${
            task.isCompleted ? "line-through text-on-surface-variant/60" : ""
          }`}
        >
          {task.title}
        </h4>
        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">
          {stripHtml(task.description) || DEFAULT_DESCRIPTION}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {task.category && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded truncate">
            {task.category}
          </span>
        )}
        {showTeam && task.teamName && (
          <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high/50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
            {task.teamName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 mt-1 border-t border-outline-variant/10">
        <div className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
          <span className="text-[12px]">📅</span>
          <span>{formattedDueDate}</span>
        </div>

        {showAssignee && (
          <div className="flex -space-x-2">
            {task.assignees && task.assignees.length > 0 ? (
              <>
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <div
                    key={assignee.id || idx}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ring-2 ring-surface relative z-10"
                    title={assignee.fullName}
                    style={{ zIndex: 10 - idx }}
                  >
                    {assignee.avatarUrl ? (
                      <img
                        src={assignee.avatarUrl}
                        alt={assignee.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {assignee.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div
                    className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold ring-2 ring-surface text-on-surface relative z-0"
                    title={`${task.assignees.length - 3} more assignees`}
                  >
                    +{task.assignees.length - 3}
                  </div>
                )}
              </>
            ) : task.assignedUserId ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ring-2 ring-surface"
                title={task.assignedUserFullName}
              >
                {task.assignedUserAvatar ? (
                  <img
                    src={task.assignedUserAvatar}
                    alt={task.assignedUserFullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {task.assignedUserFullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[12px] ring-2 ring-surface border border-dashed border-outline-variant text-outline"
                title="Unassigned"
              >
                <span className="material-symbols-outlined text-[14px]">
                  person_off
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
