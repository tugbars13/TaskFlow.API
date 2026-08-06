import {
  FiCheckSquare,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";
export default function StatsOverview({ metrics }) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    upcomingDeadlines = 0,
    highPriorityTasks = 0,
  } = metrics || {};

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
  {
    id: "total",
    icon: <FiCheckSquare />,
    label: "Tasks",
    value: String(totalTasks),
    context: totalTasks > 0 ? `+${totalTasks} active` : "0 active",
  },
  {
    id: "completed",
    icon: <FiCheckCircle />,
    label: "Completed",
    value: String(completedTasks),
    context: `${completionRate}% done`,
  },
  {
    id: "deadlines",
    icon: <FiCalendar />,
    label: "Deadlines",
    value: String(upcomingDeadlines),
    context: highPriorityTasks > 0 ? `${highPriorityTasks} urgent` : "On track",
  },
];

  return (
    <section className="dashboard-kpi-strip">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="dashboard-kpi-item"
        >
          <div className="dashboard-kpi-content">

  <span className="dashboard-kpi-icon">
    {stat.icon}
  </span>

  <div className="dashboard-kpi-info">

    <div className="dashboard-kpi-title">

      <span className="dashboard-kpi-value">
        {stat.value}
      </span>

      <span className="dashboard-kpi-label">
        {stat.label}
      </span>

    </div>

    <span className="dashboard-kpi-context">
      {stat.context}
    </span>

  </div>

</div>
        </div>
      ))}
    </section>
  );
}
