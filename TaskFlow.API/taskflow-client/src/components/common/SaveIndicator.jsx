import { cn } from "@/utils/cn";
import { SAVE_STATUS } from "@/constants/saveStatus";
export default function SaveIndicator({
  status,
  className = "",
}) {
  if (!status) return null;

  if (status === "saving") {
    return (
      <span
        className={cn(
          "flex items-center gap-2 rounded-full bg-primary/10 px-md py-xs text-xs font-semibold text-primary animate-pulse",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
        Saving...
      </span>
    );
  }

  if (status === SAVE_STATUS.SUCCESS) {
    return (
      <span
        className={cn(
          "flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50 px-md py-xs text-xs font-semibold text-emerald-700",
          className
        )}
      >
        <span className="material-symbols-outlined text-[16px]">
          check_circle
        </span>

        Saved
      </span>
    );
  }

  return null;
}