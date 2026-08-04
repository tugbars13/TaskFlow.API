import { useState, useEffect } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getTasks } from "@/features/tasks/api/taskService";

const CATEGORY_COLORS = {
  "Work": "bg-purple-600",
  "Personal": "bg-pink-500",
  "Study": "bg-indigo-500",
  "Shopping": "bg-amber-500",
  "Health": "bg-emerald-500",
  "Backend": "bg-purple-600",
  "Frontend": "bg-indigo-500",
  "Design System": "bg-pink-500",
  "Marketing": "bg-amber-500",
  "QA": "bg-emerald-500",
  "General": "bg-blue-500",
};

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
        .catch(console.error);
    }
  }, [contextTasks]);

  const activeTasks = localTasks.length > 0 ? localTasks : contextTasks || [];
  const totalTasks = activeTasks.length || 1;

  const getCategoryName = (cat) => {
    if (typeof cat === "number") {
      switch (cat) {
        case 1:
          return "Personal";
        case 2:
          return "Work";
        case 3:
          return "Study";
        case 4:
          return "Shopping";
        case 5:
          return "Health";
        default:
          return "General";
      }
    }
    return cat || "General";
  };

  // Group tasks by category dynamically from SQL Server
  const categoryCounts = {};
  activeTasks.forEach((t) => {
    const cat = getCategoryName(t.category);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryList = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / totalTasks) * 100),
      color: CATEGORY_COLORS[name] || "bg-primary",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-3xl apple-shadow border border-outline-variant/10">
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-500 text-[22px]">category</span>
          Category Breakdown
        </h3>
        <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full">
          {categoryList.length} Categories
        </span>
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
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`} />
                  <span className="font-bold text-on-surface truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-on-surface-variant font-medium">{cat.count} Tasks</span>
                  <span className="font-bold text-on-surface min-w-[36px] text-right">{cat.pct}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
