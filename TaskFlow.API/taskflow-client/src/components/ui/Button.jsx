import { cn } from "@/utils/cn";

const BASE =
  "transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS = {
  filled: `${BASE} bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90`,

  secondary: `${BASE} bg-secondary text-on-secondary rounded-full font-label-md flex items-center gap-xs`,

  ghost: `${BASE} text-primary rounded-full font-label-md flex items-center gap-xs hover:bg-primary/5`,

  text: `${BASE} text-primary font-label-md hover:underline`,

  icon: `${BASE} text-on-surface-variant hover:text-primary`,
};

const SIZES = {
  sm: "px-md py-xs text-sm",
  md: "px-lg py-sm",
  lg: "px-xl py-md text-lg",
};

export default function Button({
  children,
  variant = "filled",
  size = "md",
  type = "button",
  className = "",
  onClick,
  ariaLabel,
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}