import { formatDateDDMMYYYY } from "@/utils/dateUtils";

const PRIORITY_BORDER = {
  high: "border-l-[4px] border-l-rose-500 dark:border-l-rose-400",
  3: "border-l-[4px] border-l-rose-500 dark:border-l-rose-400",
  low: "border-l-[4px] border-l-sky-500 dark:border-l-sky-400",
  1: "border-l-[4px] border-l-sky-500 dark:border-l-sky-400",
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
}) {
  const formattedDueDate = task.dueDate
    ? formatDateDDMMYYYY(task.dueDate)
    : "—";
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`group bg-surface-container-low border border-outline-variant/10 rounded-xl p-md apple-shadow cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 ${getPriorityBorderClass(
        task.priority,
      )}`}
    >
      {/* Middle: Task Title */}
      <h4
        className={`font-headline-md text-body-md font-bold text-on-surface group-hover:text-primary transition-colors truncate ${
          task.isCompleted ? "line-through text-on-surface-variant/60" : ""
        }`}
      >
        {task.title}
      </h4>

      {/* Below: One-line Description */}
      <p className="text-xs text-on-surface-variant/80 truncate">
        {task.description || DEFAULT_DESCRIPTION}
      </p>

      {/* Bottom Right: Due Date ONLY */}
      <div className="flex items-center justify-end pt-xs mt-xs border-t border-outline-variant/10">
        <div className="flex items-center gap-xs text-[11px] font-semibold text-on-surface-variant bg-surface-container-high/40 px-xs py-0.5 rounded-lg border border-outline-variant/10">
          <span className="text-[12px]">📅</span>
          <span className="whitespace-nowrap">{formattedDueDate}</span>
        </div>
      </div>
    </div>
  );
}
