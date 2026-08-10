import { cn } from "@/utils/cn";

const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export default function Spinner({
  size = "md",
  className = "",
  ariaLabel = "Loading",
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-primary border-t-transparent",
        SIZES[size] ?? SIZES.md,
        className,
      )}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
