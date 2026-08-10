import { cn } from "@/utils/cn";

export default function ProgressBar({
  value = 0,
  className = "",
  barClassName = "",
}) {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "w-full h-1.5 rounded-full overflow-hidden bg-surface-container-high",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-all duration-700",
          barClassName,
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
