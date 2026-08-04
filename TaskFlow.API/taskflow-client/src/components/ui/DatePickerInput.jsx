import { useRef } from "react";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";

export default function DatePickerInput({
  id,
  label,
  value, // Expected in YYYY-MM-DD
  onChange,
  onBlur,
  disabled = false,
  error,
}) {
  const hiddenDateRef = useRef(null);

  // Format YYYY-MM-DD to DD/MM/YYYY for strict UI display
  const displayFormatted = value ? formatDateDDMMYYYY(value) : "DD/MM/YYYY";

  const handleContainerClick = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      if (typeof hiddenDateRef.current.showPicker === "function") {
        try {
          hiddenDateRef.current.showPicker();
        } catch {
          hiddenDateRef.current.focus();
        }
      } else {
        hiddenDateRef.current.focus();
      }
    }
  };

  return (
    <div className="space-y-xs w-full">
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
        className={`relative w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-lg text-body-md font-body-md text-on-surface apple-shadow focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center justify-between cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "ring-2 ring-error/40" : ""}`}
      >
        {/* Strict DD/MM/YYYY text rendering */}
        <span className={value ? "text-on-surface font-semibold" : "text-outline/60 font-normal"}>
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
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      {error && <p className="text-xs text-error font-medium pl-sm">{error}</p>}
    </div>
  );
}
