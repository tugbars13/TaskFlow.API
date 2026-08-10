import Card from "./Card";
import { cn } from "@/utils/cn";
export default function StatCard({
  icon,
  iconClassName = "",
  label,
  value,
  delta,
  deltaClassName = "",
}) {
  return (
    <Card className="min-h-[100px] flex items-center px-lg py-md rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all bg-white relative">
      <div
        className={cn(
          "w-[48px] h-[48px] flex items-center justify-center rounded-xl shrink-0 mr-md",
          iconClassName,
        )}
      >
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-[34px] leading-none font-bold text-on-surface">
          {value}
        </p>
        <p className="text-sm font-medium text-on-surface-variant mt-1">
          {label}
        </p>
      </div>

      {delta != null && (
        <div className="absolute top-md right-md">
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-1 rounded-full bg-surface-container-high/40",
              deltaClassName,
            )}
          >
            {delta}
          </span>
        </div>
      )}
    </Card>
  );
}
