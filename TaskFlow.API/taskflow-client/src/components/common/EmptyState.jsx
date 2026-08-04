import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function EmptyState({
  icon = "inbox",
  title = "Nothing here yet",
  description = "",
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-2xl text-center apple-shadow",
        className
      )}
    >
      <span className="material-symbols-outlined text-[56px] text-outline">
        {icon}
      </span>

      <h3 className="mt-lg font-headline-md font-bold text-on-surface">
        {title}
      </h3>

      {description && (
        <p className="mt-sm max-w-md text-body-md text-on-surface-variant">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-xl">
          {action}
        </div>
      )}
    </div>
  );
}