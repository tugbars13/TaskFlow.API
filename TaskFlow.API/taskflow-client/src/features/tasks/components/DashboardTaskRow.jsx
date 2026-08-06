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
  onClick,
}) {
  const navigate = useNavigate();

  const getPriorityDot = (p) => {
    switch (p?.toLowerCase()) {
      case "high":
      case "3":
        return "bg-status-error";
      case "low":
      case "1":
        return "bg-secondary";
      case "medium":
      case "2":
      default:
        return "bg-status-progress";
    }
  };

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate("/tasks");
    }
  };

  const formattedDate = dueDate ? formatDateDDMMYYYY(dueDate) : null;
  const taskIdDisplay = id ? `TF-${id}` : null;

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
          <span className="material-symbols-outlined text-headline-lg-mobile" aria-hidden="true">check_box_outline_blank</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-body-lg font-medium text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
            {title}
          </h4>
          <div className="flex items-center gap-sm mt-xs text-body-sm text-on-surface-variant/70 truncate">
            <span className="flex items-center gap-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(priority)}`} aria-hidden="true" />
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
            {assignee.charAt(0).toUpperCase()}
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