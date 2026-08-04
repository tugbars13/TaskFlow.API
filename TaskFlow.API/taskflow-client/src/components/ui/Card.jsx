import { cn } from "@/utils/cn";

const VARIANTS = {
  default:
    "rounded-3xl bg-surface border border-outline-variant/10 apple-shadow",

  elevated:
    "rounded-3xl bg-surface apple-shadow-lg",

  outlined:
    "rounded-3xl bg-surface border border-outline-variant",

  glass:
    "rounded-3xl glass-panel border border-outline-variant/10",
};

const PADDING = {
  none: "",
  sm: "p-md",
  md: "p-lg",
  lg: "p-xl",
};

export default function Card({
  children,
  variant = "default",
  padding = "lg",
  className = "",
}) {
  return (
    <div
      className={cn(
        VARIANTS[variant],
        PADDING[padding],
        className
      )}
    >
      {children}
    </div>
  );
}