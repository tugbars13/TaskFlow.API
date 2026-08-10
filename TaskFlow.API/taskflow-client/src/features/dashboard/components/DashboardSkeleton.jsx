const KPI_ITEMS = 3;
const PRIORITY_ITEMS = 6;
export default function DashboardSkeleton() {
  return (
    <div className="space-y-xl animate-pulse">
      {/* Header */}
      <div className="space-y-sm">
        <div className="h-8 w-48 rounded-lg bg-surface-container-high/40" />
        <div className="h-4 w-32 rounded bg-surface-container-high/40" />
      </div>

      {/* KPI Strip */}
      <div className="rounded-2xl border border-outline-variant bg-surface px-lg py-lg">
        <div className="grid grid-cols-3 divide-x divide-outline-variant">
          {Array.from({ length: KPI_ITEMS }).map((_, index) => (
            <div key={index} className="space-y-sm px-lg">
              <div className="h-3 w-20 rounded bg-surface-container-high/40" />
              <div className="h-8 w-12 rounded bg-surface-container-high/40" />
              <div className="h-3 w-24 rounded bg-surface-container-high/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Today's Priorities */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-lg space-y-md">
        <div className="flex justify-between">
          <div className="h-6 w-44 rounded bg-surface-container-high/40" />
          <div className="h-5 w-20 rounded bg-surface-container-high/40" />
        </div>

        {Array.from({ length: PRIORITY_ITEMS }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-lg bg-surface-container-high/30"
          />
        ))}
      </div>
    </div>
  );
}
