import { useMemo } from "react";
import Card from "@/components/ui/Card";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";

export default function GroupProgress() {
  const tasks = useAnalyticsTasks();

  const groups = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      // Group by teamName, fallback to "Personal"
      const groupName = t.teamName || "Personal";
      if (!map[groupName]) {
        map[groupName] = { total: 0, completed: 0 };
      }
      map[groupName].total += 1;
      if (t.isCompleted) {
        map[groupName].completed += 1;
      }
    });

    return Object.entries(map)
      .map(([name, data]) => {
        const pct =
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        return { name, ...data, pct };
      })
      .sort((a, b) => b.total - a.total); // En çok görev olan grup üstte
  }, [tasks]);

  return (
    <Card
      variant="default"
      className="col-span-12 md:col-span-12 lg:col-span-4 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8 shrink-0">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            group_work
          </span>
          Group Progress
        </h3>
      </div>

      <div className="flex flex-col gap-6 flex-1 pt-1">
        {groups.length === 0 ? (
          <div className="text-center text-on-surface-variant text-sm mt-4">
            No tasks available.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface">
                  {group.name}
                </span>
                <span className="text-sm font-extrabold text-on-surface">
                  {group.pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${group.pct}%` }}
                />
              </div>

              {/* Text Below */}
              <div className="text-[11px] text-on-surface-variant font-semibold mt-0.5">
                {group.completed} / {group.total} tasks
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
