import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";
const PRIORITY_DOT_COLORS = Object.freeze({
  high: "bg-status-error",
  3: "bg-status-error",

  medium: "bg-status-progress",
  2: "bg-status-progress",

  low: "bg-secondary",
  1: "bg-secondary",
});
export default function DashboardTaskRow({
  id,
  title,
  description,
  teamName,
  priority,
  dueDate,
  assignee,
  onClick,
}) {
  const navigate = useNavigate();

  const getPriorityDot = (priority) =>
    PRIORITY_DOT_COLORS[priority?.toLowerCase()] ?? "bg-status-progress";

  const handleCardClick = useCallback(
    (event) => {
      if (onClick) {
        onClick(event);
        return;
      }

      navigate("/tasks");
    },
    [navigate, onClick],
  );

  const formattedDate = dueDate ? formatDateDDMMYYYY(dueDate) : null;
  const taskIdDisplay = id != null ? `TF-${id}` : null;

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="w-full py-md px-sm hover:bg-surface-container-low/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors duration-150 group cursor-pointer flex items-center justify-between text-left"
    >
      {/* Left Content Area */}
      <div className="flex items-start gap-md flex-1 min-w-0">
        {/* Subtle Checkbox Icon */}
        <div className="mt-xs text-outline-variant/60 group-hover:text-primary transition-colors shrink-0">
          <span
            className="material-symbols-outlined text-headline-lg-mobile"
            aria-hidden="true"
          >
            check_box_outline_blank
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-body-lg font-medium text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
            {title}
          </h4>
          <div className="flex items-center gap-sm mt-xs text-body-sm text-on-surface-variant/70 truncate">
            <span className="flex items-center gap-xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(priority)}`}
                aria-hidden="true"
              />
              Task
            </span>
            {taskIdDisplay && (
              <>
                <span>•</span>
                <span>{taskIdDisplay}</span>
              </>
            )}
            {teamName && (
              <>
                <span>•</span>
                <span>{teamName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Avatar & Date */}
      <div className="flex items-center gap-md shrink-0 pl-md">
        {/* Subtle Avatar */}
        {assignee && (
          <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-label-sm font-bold text-on-surface-variant">
            {assignee[0]?.toUpperCase()}
          </div>
        )}
        {/* Subtle Date */}
        {formattedDate && (
          <div className="text-body-sm text-on-surface-variant/60 text-right">
            {formattedDate}
          </div>
        )}
      </div>
    </button>
  );
}
