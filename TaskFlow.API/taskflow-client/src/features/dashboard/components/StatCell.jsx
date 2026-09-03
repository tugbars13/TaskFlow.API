import { cn } from "@/utils/cn";

export default function StatCell({ icon, iconCls, value, label, sub, loading }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div
        className={cn(
          "size-9 rounded-full flex items-center justify-center shrink-0",
          iconCls,
        )}
      >
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-5 w-8 rounded bg-gray-100 animate-pulse mb-1" />
        ) : (
          <div className="text-[22px] font-bold text-on-surface leading-none">
            {value}
          </div>
        )}
        <div className="text-[12px] font-semibold text-on-surface leading-none mt-0.5">
          {label}
        </div>
        <div className="text-[11px] text-on-surface-variant/60 font-medium mt-0.5 truncate">
          {sub}
        </div>
      </div>
    </div>
  );
}
