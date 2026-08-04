export default function Spinner({
  size = "md",
  className = "",
  ariaLabel = "Loading"
}) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block animate-spin rounded-full border-solid border-primary border-t-transparent ${sizes[size] || sizes.md} ${className}`.trim()}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}