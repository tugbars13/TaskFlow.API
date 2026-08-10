import { useId } from "react";
import { cn } from "@/utils/cn";

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
  readOnly = false,
  description,
  hideLabel = false,
  size = "md",
  variant = "default",
  startAdornment,
  endAdornment,
  containerClassName = "",
  inputClassName = "",
  className = "",
  "aria-describedby": nativeDescribedBy,
  "aria-invalid": nativeAriaInvalid,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [nativeDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") ||
    undefined;
  const resolvedSize = size === "sm" ? "sm" : "md";
  const resolvedVariant = variant === "search" ? "search" : "default";
  const legacyIcon = icon ? (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {icon}
    </span>
  ) : null;
  const resolvedStartAdornment = startAdornment ?? legacyIcon;

  return (
    <div className={cn("input-field", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn("input-label", hideLabel && "sr-only")}
        >
          {label}
          {required && (
            <span className="input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="input-control">
        {resolvedStartAdornment && (
          <span className="input-adornment input-adornment--start">
            {resolvedStartAdornment}
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
          readOnly={readOnly}
          aria-describedby={describedBy}
          aria-invalid={error ? true : nativeAriaInvalid}
          className={cn(
            "input apple-shadow",
            `input--${resolvedSize}`,
            `input--${resolvedVariant}`,
            resolvedStartAdornment && "input--has-start-adornment",
            endAdornment && "input--has-end-adornment",
            error && "input--error",
            inputClassName,
            className,
          )}
          {...props}
        />

        {endAdornment && (
          <span className="input-adornment input-adornment--end">
            {endAdornment}
          </span>
        )}
      </div>

      {description && (
        <p id={descriptionId} className="input-description">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="input-error">
          {error}
        </p>
      )}
    </div>
  );
}
