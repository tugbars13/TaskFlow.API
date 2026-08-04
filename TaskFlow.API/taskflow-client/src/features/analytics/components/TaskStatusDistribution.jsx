import { useState, useEffect } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getTasks } from "@/features/tasks/api/taskService";

export default function TaskStatusDistribution() {
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

  const completed = activeTasks.filter(
    (t) => t.isCompleted || t.status === "completed" || t.status === 4 || t.status === "4"
  ).length;

  const inProgress = activeTasks.filter(
    (t) =>
      !t.isCompleted &&
      (t.status === "in_progress" || t.status === "inprogress" || t.status === 3 || t.status === "3")
  ).length;

  const todo = activeTasks.filter(
    (t) => !t.isCompleted && (t.status === "todo" || t.status === 2 || t.status === "2")
  ).length;

  const backlog = activeTasks.filter(
    (t) =>
      !t.isCompleted &&
      (t.status === "backlog" || t.status === 1 || t.status === "1" || !t.status)
  ).length;

  const statusItems = [
    {
      label: "Completed",
      count: completed,
      pct: Math.round((completed / totalTasks) * 100),
      color: "bg-emerald-500",
      strokeColor: "#10b981",
    },
    {
      label: "In Progress",
      count: inProgress,
      pct: Math.round((inProgress / totalTasks) * 100),
      color: "bg-primary",
      strokeColor: "#7C3AED",
    },
    {
      label: "To Do",
      count: todo,
      pct: Math.round((todo / totalTasks) * 100),
      color: "bg-purple-400",
      strokeColor: "#c084fc",
    },
    {
      label: "Backlog",
      count: backlog,
      pct: Math.round((backlog / totalTasks) * 100),
      color: "bg-amber-500",
      strokeColor: "#f59e0b",
    },
  ];

  return (
    <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-3xl apple-shadow border border-outline-variant/10">
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">donut_large</span>
          Task Status Distribution
        </h3>
        <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full">
          {activeTasks.length} Total Tasks
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* SVG Donut Chart Viz */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-40 h-40 -rotate-90">
            <circle
              className="fill-none stroke-surface-container-high"
              cx="80"
              cy="80"
              r="60"
              strokeWidth="14"
            />
            <circle
              className="fill-none transition-all duration-1000"
              cx="80"
              cy="80"
              r="60"
              strokeWidth="14"
              stroke={statusItems[0].strokeColor}
              strokeDasharray="376.99"
              strokeDashoffset={376.99 - (376.99 * statusItems[0].pct) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-on-surface">{activeTasks.length}</span>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Tasks
            </span>
          </div>
        </div>

        {/* Status Breakdown Legend List */}
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                <span className="font-semibold text-on-surface truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-on-surface-variant font-medium">{item.count} Tasks</span>
                <span className="font-bold text-on-surface min-w-[36px] text-right">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
