import { cn } from "@/utils/cn";
export default function Checkbox({
  checked,
  onChange,
  label,
  id,
  className = "",
  disabled = false,
}) {
  return (
    <div className={cn("flex items-center gap-sm", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className={cn(
          "size-5 rounded border-outline-variant text-primary transition-all focus:ring-primary/20",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      />
      {label && (
        <label
          htmlFor={id}
          className="font-body-sm text-body-sm leading-[20px] font-normal text-on-surface-variant cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
