import { cn } from "@/utils/cn";

const VARIANTS = {
  default: "card--default apple-shadow",
  elevated: "apple-shadow",
  outlined: "card--outlined",
  filled: "card--filled",
  glass: "card--glass glass-panel",
};

const PADDING = {
  none: "card--padding-none",
  sm: "card--padding-sm",
  md: "card--padding-md",
  lg: "card--padding-lg",
};

export default function Card({
  children,
  variant = "default",
  padding = "lg",
  className = "",
  hover = false,
  clickable = false,
  ...props
}) {
  const resolvedVariant = VARIANTS[variant] || VARIANTS.default;
  const resolvedPadding = PADDING[padding] || PADDING.lg;

  const handleKeyDown = (e) => {
    if (clickable && (e.key === "Enter" || e.key === " ") && props.onClick) {
      e.preventDefault();
      props.onClick(e);
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div
      className={cn(
        "card",
        resolvedVariant,
        resolvedPadding,
        hover && "card--hoverable apple-shadow-hover",
        clickable && "card--clickable",
        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
      onKeyDown={clickable ? handleKeyDown : props.onKeyDown}
    >
      {children}
    </div>
  );
}
