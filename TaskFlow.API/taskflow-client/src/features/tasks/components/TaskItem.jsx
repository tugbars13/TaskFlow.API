import { useNavigate } from "react-router-dom";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";

export default function TaskItem({
  title,
  description,
  teamName = "Backend Team",
  priority,
  dueDate,
  onClick,
}) {
  const navigate = useNavigate();

  const getPriorityBorderClass = (p) => {
    switch (p?.toLowerCase()) {
      case "high":
      case "3":
        return "border-l-[4px] border-l-rose-500 dark:border-l-rose-400";
      case "low":
      case "1":
        return "border-l-[4px] border-l-sky-500 dark:border-l-sky-400";
      case "medium":
      case "2":
      default:
        return "border-l-[4px] border-l-amber-500 dark:border-l-amber-400";
    }
  };

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate("/tasks");
    }
  };

  const formattedDate = dueDate ? formatDateDDMMYYYY(dueDate) : "29/08/2026";

  return (
    <div
      onClick={handleCardClick}
      className={`w-full bg-surface border border-outline-variant/10 ${getPriorityBorderClass(
        priority
      )} rounded-2xl py-sm px-md sm:px-lg apple-shadow hover:apple-shadow-hover hover:border-primary/20 transition-all duration-200 group cursor-pointer flex items-center justify-between gap-md`}
    >
      {/* Left Content Area */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Top-left: Team Name */}
        <div className="text-[12px] font-medium text-on-surface-variant/70 dark:text-gray-400 truncate">
          {teamName || "Backend Team"}
        </div>

        {/* Task Title */}
        <h4 className="font-headline-md text-body-md font-bold text-on-surface group-hover:text-primary transition-colors truncate">
          {title}
        </h4>

        {/* One-line Description */}
        <p className="text-xs text-on-surface-variant/80 truncate">
          {description || "Finalize feature implementation and design token alignment."}
        </p>
      </div>

      {/* Right Side: Due Date ONLY */}
      <div className="shrink-0 flex items-center gap-xs text-xs font-semibold text-on-surface-variant bg-surface-container-high/40 px-xs sm:px-md py-xs rounded-xl border border-outline-variant/10">
        <span className="text-[14px]">📅</span>
        <span className="whitespace-nowrap">{formattedDate}</span>
      </div>
    </div>
  );
}