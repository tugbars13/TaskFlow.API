const BASE_CLASSES = "px-sm py-0.5 rounded-full text-xs font-label-md";

export default function Badge({ children, className = "" }) {
  return <span className={`${BASE_CLASSES} ${className}`.trim()}>{children}</span>;
}
