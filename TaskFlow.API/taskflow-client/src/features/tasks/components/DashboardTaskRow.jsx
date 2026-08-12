import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";

export default function DashboardTaskRow({
  id,
  title,
  description,
  teamName,
  priority,
  dueDate,
  assignee,
  isCompleted,
  status,
  onClick,
}) {
  const navigate = useNavigate();

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
  const statusDisplay = status || (isCompleted ? "Completed" : "In Progress");

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="w-full py-3.5 px-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 apple-shadow hover:border-primary/30 hover:bg-surface-container-low/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 group cursor-pointer flex items-center justify-between text-left gap-4 h-[72px]"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? "text-emerald-500" : "text-outline-variant/60 group-hover:text-primary"}`}>
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            {isCompleted ? "check_box" : "check_box_outline_blank"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold truncate leading-tight transition-colors ${isCompleted ? "text-on-surface-variant line-through" : "text-on-surface group-hover:text-primary"}`}>
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 mt-1.5 text-xs text-on-surface-variant font-medium">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} />
              Task
            </span>
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <span>•</span>
                {formattedDate}
              </span>
            )}
            {teamName && (
              <span className="flex items-center gap-1.5">
                <span>•</span>
                {teamName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 shrink-0 ml-auto">
        <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center justify-center ${
          isCompleted 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-surface-container-high text-on-surface-variant border-outline-variant/20"
        }`}>
          {statusDisplay}
        </div>
        
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/50 group-hover:text-on-surface-variant transition-colors hover:bg-surface-container-highest">
          <span className="material-symbols-outlined text-[20px]">
            more_vert
          </span>
        </div>
      </div>
    </button>
  );
}
