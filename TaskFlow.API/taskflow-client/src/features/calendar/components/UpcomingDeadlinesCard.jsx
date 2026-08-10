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
    <Card className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-amber-500">
            alarm
          </span>

          <h3 className="font-headline-md font-bold text-on-surface">
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
          <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant/20">
            No upcoming deadlines scheduled.
          </div>
        ) : (
          sortedDeadlines.map((item) => (
            <div
              key={item.id}
              onClick={() => onTaskClick?.(item)}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 hover:border-amber-500/30 hover:bg-surface-container-high/40 hover:-translate-y-0.5 apple-shadow transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
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
