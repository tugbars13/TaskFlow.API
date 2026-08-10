import { useRef } from "react";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";
import { cn } from "@/utils/cn";
export default function DatePickerInput({
  id,
  label,
  value, // Expected in YYYY-MM-DD
  onChange,
  onBlur,
  disabled = false,
  error,
  className = "",
  ...props
}) {
  const hiddenDateRef = useRef(null);

  // Format YYYY-MM-DD to DD/MM/YYYY for strict UI display
  const displayFormatted = value ? formatDateDDMMYYYY(value) : "DD/MM/YYYY";

  const handleContainerClick = () => {
    if (disabled) return;

    const input = hiddenDateRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else {
      input.focus();
    }
  };

  return (
    <div className={cn("space-y-xs w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block font-label-md text-label-md font-semibold text-on-surface"
        >
          {label}
        </label>
      )}
      <div
        onClick={handleContainerClick}
        className={cn(
          "relative w-full bg-surface-container-high/50 rounded-2xl py-[14px] px-lg text-body-md font-body-md text-on-surface apple-shadow focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center justify-between cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          error && "ring-2 ring-error/40",
        )}
      >
        {/* Strict DD/MM/YYYY text rendering */}
        <span
          className={cn(
            value
              ? "text-on-surface font-semibold"
              : "text-outline/60 font-normal",
          )}
        >
          {displayFormatted}
        </span>

        <span className="material-symbols-outlined text-primary text-[20px] pointer-events-none">
          calendar_month
        </span>

        {/* Native datepicker trigger */}
        <input
          id={id}
          ref={hiddenDateRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange?.(e)}
          onBlur={(e) => onBlur?.(e)}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error font-medium pl-sm">{error}</p>}
    </div>
  );
}
