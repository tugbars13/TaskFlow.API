export default function Checkbox({
  checked,
  onChange,
  label,
  id = "checkbox"
}) {
  return (
    <div className="flex items-center gap-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
      />
      {label && (
        <label htmlFor={id} className="font-body-sm text-body-sm leading-[20px] font-normal text-on-surface-variant cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
}