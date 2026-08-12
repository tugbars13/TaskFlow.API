import { useState, useEffect, useMemo } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getTasks } from "@/features/tasks/api/taskService";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { CATEGORY_COLORS } from "@/features/analytics/constants/category.constants";
import { getCategoryName } from "@/features/analytics/utils/category.utils";
export default function CategoryBreakdown() {
  const { tasks: contextTasks } = useTasks();
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    if (Array.isArray(contextTasks) && contextTasks.length > 0) {
      setLocalTasks(contextTasks);
    } else {
      getTasks()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLocalTasks(data);
          }
        })
        .catch((error) => {
          console.error("Failed to load tasks:", error);
        });
    }
  }, [contextTasks]);

  const activeTasks = localTasks.length > 0 ? localTasks : (contextTasks ?? []);
  const totalTasks = Math.max(activeTasks.length, 1);

  // Group tasks by category dynamically from SQL Server
  const categoryList = useMemo(() => {
    const categoryCounts = {};

    activeTasks.forEach((task) => {
      const category = getCategoryName(task.category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalTasks) * 100),
        color: CATEGORY_COLORS[name] ?? "bg-primary",
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeTasks, totalTasks]);
  return (
    <Card className="col-span-12 md:col-span-6 lg:col-span-4" variant="default">
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">
            category
          </span>
          Category Breakdown
        </h3>
        <Badge className="bg-surface-container-high text-on-surface-variant font-bold">
          {categoryList.length} Categories
        </Badge>
      </div>

      <div className="space-y-4">
        {categoryList.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant/20">
            No category metrics available.
          </div>
        ) : (
          categoryList.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`}
                  />
                  <span className="font-bold text-on-surface truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className="bg-surface-container-high text-on-surface-variant">
                    {cat.count} Tasks
                  </Badge>
                  <span className="font-bold text-on-surface min-w-[36px] text-right">
                    {cat.pct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar value={cat.pct} barClassName={cat.color} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
