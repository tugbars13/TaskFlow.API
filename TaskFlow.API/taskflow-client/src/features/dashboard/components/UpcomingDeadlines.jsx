import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const URGENCY_STYLES = Object.freeze({
  urgent: "bg-error-container/30 text-error border-error/20",
  warning: "bg-tertiary-container/30 text-tertiary border-tertiary/20",
  normal:
    "bg-surface-container-high text-on-surface-variant border-transparent",
});
export default function UpcomingDeadlines({ deadlines = [] }) {
  return (
    <Card className="apple-shadow">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md font-semibold text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-error">alarm</span>
          Upcoming Deadlines
        </h3>
        <button
          type="button"
          className="text-primary font-label-md text-label-md hover:underline cursor-pointer"
        >
          Calendar
        </button>
      </div>

      <div className="space-y-sm">
        {deadlines.length === 0 ? (
          <div className="p-md text-center text-xs text-on-surface-variant bg-surface-container-low/40 rounded-xl">
            No upcoming deadlines scheduled.
          </div>
        ) : (
          deadlines.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-sm md:p-md rounded-xl bg-surface-container-low/40 hover:bg-surface-container-lowest border border-outline-variant/10 transition-colors apple-shadow-hover"
            >
              <div className="flex items-center gap-md">
                <div
                  className={`p-xs rounded-lg border flex items-center justify-center ${URGENCY_STYLES[item.urgency] || URGENCY_STYLES.normal}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    event
                  </span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">
                      schedule
                    </span>
                    {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-sm">
                <Badge className="bg-secondary/10 text-secondary hidden sm:inline-block">
                  {item.tag}
                </Badge>
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center border border-primary/20">
                  {(item.assignee || "AM").slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
