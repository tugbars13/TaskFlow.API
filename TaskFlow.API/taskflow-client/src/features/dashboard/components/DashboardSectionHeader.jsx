export default function DashboardSectionHeader({ icon, label, onViewAll }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2.5 border-b border-outline-variant/10">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-[15px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
          {label}
        </h2>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          Tümünü Gör
        </button>
      )}
    </div>
  );
}
