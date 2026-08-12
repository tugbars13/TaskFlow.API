import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function PageError({
  title = "Something went wrong",
  description = "An unexpected error occurred.",
  icon = "error_outline",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={cn(
        "my-xl space-y-md",
        "rounded-3xl border border-error/20",
        "bg-surface p-xl",
        "text-center apple-shadow",
        className
      )}
    >
      <span className="material-symbols-outlined text-error text-[48px]">
        {icon}
      </span>

      <h3 className="font-headline-md font-bold text-on-surface">
        {title}
      </h3>

      <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
        {description}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="filled">
          <span className="material-symbols-outlined text-[18px]">
            refresh
          </span>

          Retry
        </Button>
      )}
    </div>
  );
}
