import { cn } from "@/utils/cn";

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  className = "",
}) {
  return (
    <header
      className={cn(
          "flex flex-col gap-lg",
          "md:flex-row md:items-center md:justify-between",
          "border-b border-outline-variant/10 pb-lg",
          className
      )}
    >
      <div>
        <div className="flex items-center gap-sm">
          {icon && (
            <span className="material-symbols-outlined text-primary text-[28px]">
              {icon}
            </span>
          )}

          <h1 className="text-display-lg font-display-lg font-bold text-on-surface">
            {title}
          </h1>
        </div>

        {subtitle && (
          <p className="mt-xs text-body-md text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-md">
          {actions}
        </div>
      )}
    </header>
  );
}
