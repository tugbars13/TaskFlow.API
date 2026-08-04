export default function ProductivityPulse({ pulse }) {
  const {
    weeklyCompletedTasks = 0,
    weeklyChangePercentage = 0,
    dailyCompletionTrend = [0, 0, 0, 0, 0, 0, 0],
  } = pulse || {};

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const maxVal = Math.max(...dailyCompletionTrend, 1);
  const maxIdx = dailyCompletionTrend.indexOf(Math.max(...dailyCompletionTrend));

  const bars = days.map((day, idx) => {
    const val = dailyCompletionTrend[idx] || 0;
    const heightPct = Math.max(Math.round((val / maxVal) * 100), 10);
    return {
      day,
      title: `${dayNames[idx]}: ${val} completed`,
      height: `${heightPct}%`,
      isHighlight: idx === maxIdx && val > 0,
    };
  });

  const isPositiveChange = weeklyChangePercentage >= 0;

  return (
    <div className="space-y-md h-full flex flex-col justify-between">
      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Productivity Pulse</h3>
      <div className="bg-surface-container-lowest p-lg rounded-2xl apple-shadow border border-outline-variant/10 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <p className="text-headline-lg font-headline-lg font-bold text-primary leading-none">
              {weeklyCompletedTasks} Tasks
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">Weekly completed tasks</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isPositiveChange
                ? "bg-green-50 text-green-700 border-green-200/50"
                : "bg-rose-50 text-rose-700 border-rose-200/50"
            }`}
          >
            {isPositiveChange ? `+${weeklyChangePercentage}%` : `${weeklyChangePercentage}%`} vs last week
          </span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-md px-xs my-md min-h-[140px]">
          {bars.map((bar, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <div
                className={`w-full rounded-t-xl transition-all ${
                  bar.isHighlight
                    ? "bg-primary hover:opacity-90 shadow-xs"
                    : "bg-surface-container-high hover:bg-secondary-container"
                }`}
                style={{ height: bar.height }}
                title={bar.title}
              />
              <span
                className={`text-xs ${
                  bar.isHighlight ? "text-primary font-bold" : "text-on-surface-variant font-medium"
                }`}
              >
                {bar.day}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-md border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-container-high" />
            <span className="text-xs font-medium text-on-surface-variant">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}