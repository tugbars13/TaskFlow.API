import StatCell from "./StatCell";

export default function DashboardStats({ metrics, mySpace }) {
  const totalTasks = metrics?.totalTasks ?? 0;
  const completedTasks = metrics?.completedTasks ?? 0;
  const activeTasks = totalTasks - completedTasks;
  const upcomingDeadlines = metrics?.upcomingDeadlines ?? 0;
  const highPriorityTasks = metrics?.highPriorityTasks ?? 0;

  const stats = [
    {
      icon: "task_alt",
      iconCls: "bg-primary/10 text-primary",
      value: totalTasks,
      label: "Görev",
      sub: `${activeTasks} devam ediyor`,
    },
    {
      icon: "check_circle",
      iconCls: "bg-emerald-100 text-emerald-600",
      value: completedTasks,
      label: "Tamamlanan",
      sub: `${completedTasks} bitti`,
    },
    {
      icon: "event",
      iconCls: "bg-amber-100 text-amber-600",
      value: upcomingDeadlines,
      label: "Termin",
      sub: `${highPriorityTasks} risk altında`,
    },
    {
      icon: "folder_open",
      iconCls: "bg-blue-100 text-blue-600",
      value: mySpace.folders.length,
      label: "Klasör",
      sub: "My Space",
      loading: mySpace.loading,
    },
    {
      icon: "description",
      iconCls: "bg-purple-100 text-purple-600",
      value: mySpace.pages.length,
      label: "Sayfa",
      sub: "tüm alanlarda",
      loading: mySpace.loading,
    },
  ];

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest mb-5 overflow-hidden shadow-sm">
      <div className="grid grid-cols-5 divide-x divide-outline-variant/15">
        {stats.map((s, i) => (
          <StatCell key={i} {...s} />
        ))}
      </div>
    </div>
  );
}
