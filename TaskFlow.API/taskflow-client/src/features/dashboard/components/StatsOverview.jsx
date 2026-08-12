export default function StatsOverview({ metrics }) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    upcomingDeadlines = 0,
    highPriorityTasks = 0,
  } = metrics || {};

  const activeTasks = totalTasks > 0 ? totalTasks - completedTasks : 0;

  const stats = [
    {
      id: "total",
      icon: "task_alt",
      color: "bg-primary/10 text-primary dark:text-primary",
      label: "Tasks",
      value: String(totalTasks),
      context: activeTasks > 0 ? `• ${activeTasks} in progress` : "• 0 in progress",
    },
    {
      id: "completed",
      icon: "check_circle",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      label: "Completed",
      value: String(completedTasks),
      context: `• ${completedTasks} done`,
    },
    {
      id: "deadlines",
      icon: "event",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      label: "Deadlines",
      value: String(upcomingDeadlines),
      context: `• ${highPriorityTasks} at risk`,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 w-full">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/10 p-5 apple-shadow flex items-start gap-4 h-[120px]"
        >
          {/* Left: Icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
            <span className="material-symbols-outlined text-[26px]">
              {stat.icon}
            </span>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col flex-1 h-full pt-1">
            <span className="text-[36px] font-bold text-on-surface leading-none tracking-tight mb-1">
              {stat.value}
            </span>
            <h3 className="text-[15px] font-medium text-on-surface-variant leading-none mb-1.5">
              {stat.label}
            </h3>
            <p className="text-[13px] text-on-surface-variant/70 font-medium leading-none">
              {stat.context}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
