import { cn } from "@/utils/cn";

const BASE_INPUT =
  "w-full rounded-2xl bg-surface-container-high/50 text-on-surface placeholder:text-outline/60 apple-shadow transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

export default function Input({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const inputId = id || name;

  return (
    <div className="w-full space-y-xs">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-label-md font-label-md font-semibold text-on-surface"
        >
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-[20px] text-outline">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            BASE_INPUT,
            icon ? "pl-10 pr-md py-[10px]" : "px-md py-[10px]",
            error && "ring-2 ring-error/40",
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}