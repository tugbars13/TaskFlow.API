import { cn } from "@/utils/cn";

const VARIANTS = {
  primary: "button--primary",
  // Deprecated compatibility alias. Migrate consumers to `primary` later.
  filled: "button--primary",
  secondary: "button--secondary",
  tonal: "button--tonal",
  outline: "button--outline",
  ghost: "button--ghost",
  text: "button--text",
  destructive: "button--destructive",
};

const SIZES = {
  sm: "button--sm",
  md: "button--md",
  lg: "button--lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  onClick,
  ariaLabel,
  disabled = false,
  startIcon,
  endIcon,
  iconOnly = false,
  loading = false,
  loadingText,
  "aria-label": nativeAriaLabel,
  ...props
}) {
  const accessibleLabel = ariaLabel ?? nativeAriaLabel;
  const isDisabled = disabled || loading;
  const resolvedVariant = VARIANTS[variant] ?? VARIANTS.primary;
  const resolvedSize = SIZES[size] ?? SIZES.md;
  const visibleContent = loadingText && loading ? loadingText : children;
  const iconContent = startIcon ?? endIcon ?? children;

  if (iconOnly && !accessibleLabel) {
    throw new Error("Button with iconOnly requires an ariaLabel.");
  }

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      aria-label={accessibleLabel}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(
        "button",
        resolvedVariant,
        resolvedSize,
        iconOnly && "button--icon-only",
        className,
      )}
    >
      {loading && <span className="button__spinner" aria-hidden="true" />}

      {iconOnly ? (
        !loading && (
          <span className="button__icon" aria-hidden="true">
            {iconContent}
          </span>
        )
      ) : (
        <>
          {!loading && startIcon && (
            <span className="button__icon" aria-hidden="true">
              {startIcon}
            </span>
          )}
          <span className="button__label">{visibleContent}</span>
          {!loading && endIcon && (
            <span className="button__icon" aria-hidden="true">
              {endIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
