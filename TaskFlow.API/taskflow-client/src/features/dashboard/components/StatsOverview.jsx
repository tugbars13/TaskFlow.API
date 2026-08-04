import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";

export default function StatsOverview({ metrics }) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    upcomingDeadlines = 0,
    productivityScore = 0,
    highPriorityTasks = 0,
  } = metrics || {};

  const stats = [
    {
      id: "total",
      label: "Total Tasks",
      value: String(totalTasks),
      delta: totalTasks > 0 ? `+${totalTasks}` : "0 Tasks",
      deltaClassName: "text-green-600 font-bold",
      icon: "assignment",
      iconClassName: "text-primary bg-primary/10",
    },
    {
      id: "completed",
      label: "Completed",
      value: String(completedTasks),
      delta: completedTasks > 0 ? `+${completedTasks}` : "0 Done",
      deltaClassName: "text-green-600 font-bold",
      icon: "task_alt",
      iconClassName: "text-secondary bg-secondary/10",
    },
    {
      id: "deadlines",
      label: "Upcoming Deadlines",
      value: String(upcomingDeadlines),
      delta: `${highPriorityTasks} Urgent`,
      deltaClassName: highPriorityTasks > 0 ? "text-error font-bold" : "text-on-surface-variant font-medium",
      icon: "event_busy",
      iconClassName: "text-error bg-error-container/30",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          iconClassName={stat.iconClassName}
          label={stat.label}
          value={stat.value}
          delta={stat.delta}
          deltaClassName={stat.deltaClassName}
        />
      ))}

      {/* Featured Productivity Score Card */}
      <Card
        padding="md"
        className="bg-primary text-on-primary relative overflow-hidden h-full flex flex-col justify-between transition-all hover:apple-shadow-hover"
      ></Card>
    </section>
  );
}
