export default function ProgressBar({
  value = 0,
  className = "",
  barClassName = "",
}) {
  return (
    <div
      className={`w-full h-1.5 rounded-full overflow-hidden bg-surface-container-high ${className}`}
    >
      <div
        className={`h-full transition-all duration-700 rounded-full bg-primary ${barClassName}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}