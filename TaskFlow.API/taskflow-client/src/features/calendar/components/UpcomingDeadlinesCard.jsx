import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDateDDMMYYYY } from "@/utils/dateUtils";

export default function UpcomingDeadlinesCard({
  deadlines = [],
  onViewAll,
  onTaskClick,
}) {
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge variant="error">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const sortedDeadlines = (deadlines || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <Card className="p-4 rounded-2xl apple-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-2 h-6">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-[18px]">
            alarm
          </span>

          <h3 className="text-sm font-bold text-on-surface">
            Upcoming Deadlines
          </h3>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {sortedDeadlines.length === 0 ? (
          <div className="py-4 text-center text-xs text-on-surface-variant font-medium">
            No upcoming deadlines.
          </div>
        ) : (
          sortedDeadlines.map((item) => (
            <div
              key={item.id}
              onClick={() => onTaskClick?.(item)}
              className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-amber-500/30 hover:bg-surface-container-high/40 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">
                    calendar_today
                  </span>
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="text-xs font-semibold text-on-surface truncate group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                    {item.dueDate ? formatDateDDMMYYYY(item.dueDate) : "Today"}
                  </p>
                </div>
              </div>

              {getPriorityBadge(item.priority)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
