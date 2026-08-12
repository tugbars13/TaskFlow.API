const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export default function CalendarGrid({
  currentMonthIndex,
  currentYear,
  tasks = [],
  selectedDay,
  onSelectDay,
  onDoubleClickDay,
  todayDay = new Date().getDate(),
  todayMonth = new Date().getMonth(),
  todayYear = new Date().getFullYear(),
}) {
  const daysInMonthCount = new Date(
    currentYear,
    currentMonthIndex + 1,
    0,
  ).getDate();
  const firstDayOfWeek =
    (new Date(currentYear, currentMonthIndex, 1).getDay() + 6) % 7; // Mon = 0

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const prevMonthCount = new Date(currentYear, currentMonthIndex, 0).getDate();
  const prevOverflowDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => prevMonthCount - firstDayOfWeek + i + 1,
  );

  const totalCellsSoFar = prevOverflowDays.length + daysInMonth.length;
  const nextOverflowCount = (7 - (totalCellsSoFar % 7)) % 7;
  const nextOverflowDays = Array.from(
    { length: nextOverflowCount },
    (_, i) => i + 1,
  );

  const now = new Date();
  const getIndicatorsForDay = (day) => {
    const isToday =
      day === todayDay &&
      currentMonthIndex === todayMonth &&
      currentYear === todayYear;

    const dayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonthIndex &&
        d.getFullYear() === currentYear
      );
    });

    const indicators = [];

    if (isToday) {
      indicators.push({
        label: "Today",
        color:
          "bg-primary/10 text-primary dark:text-primary border-primary/30",
      });
    }

    const completed = dayTasks.filter((t) => t.isCompleted);
    if (completed.length > 0) {
      indicators.push({
        label: `${completed.length} Completed`,
        color:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      });
    }

    const upcoming = dayTasks.filter(
      (t) => !t.isCompleted && new Date(t.dueDate) >= now,
    );
    if (upcoming.length > 0) {
      indicators.push({
        label: `${upcoming.length} Upcoming`,
        color:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      });
    }

    const overdue = dayTasks.filter(
      (t) => !t.isCompleted && new Date(t.dueDate) < now,
    );
    if (overdue.length > 0) {
      indicators.push({
        label: `${overdue.length} Overdue`,
        color:
          "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
      });
    }

    return indicators;
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 apple-shadow overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {/* Previous Month Overflow Days */}
        {prevOverflowDays.map((d) => (
          <div
            key={`prev-${d}`}
            className="h-24 p-2 rounded-xl bg-background-canvas/30 text-on-surface-variant/20 text-xs font-medium pointer-events-none opacity-40 select-none"
          >
            {d}
          </div>
        ))}

        {/* Current Month Days */}
        {daysInMonth.map((day) => {
          const isToday =
            day === todayDay &&
            currentMonthIndex === todayMonth &&
            currentYear === todayYear;

          const isSelected = day === selectedDay;
          const indicators = getIndicatorsForDay(day);
          const visibleIndicators = indicators.slice(0, 3);
          const extraCount = Math.max(0, indicators.length - 3);

          return (
            <div
              key={day}
              onClick={() => onSelectDay?.(day)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClickDay?.(day);
              }}
              className={`h-24 p-2 rounded-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? "border border-primary/50 bg-primary/[0.05] shadow-sm"
                  : isToday
                    ? "border border-primary/40 bg-primary/[0.03]"
                    : "bg-surface-container-lowest hover:bg-surface-container-high/40 border border-outline-variant/10"
              }`}
            >
              {/* Top Bar inside Cell */}
              <div className="flex items-center justify-between pointer-events-none">
                <span
                  className={`text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isToday
                      ? "bg-primary text-white shadow-sm"
                      : isSelected
                        ? "bg-primary/20 text-primary dark:text-primary"
                        : "text-on-surface group-hover:text-primary"
                  }`}
                >
                  {day}
                </span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                )}
              </div>

              {/* Standardized Indicators List */}
              <div className="space-y-1 my-0.5 overflow-hidden pointer-events-none">
                {visibleIndicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className={`h-5 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center justify-center truncate border ${ind.color}`}
                  >
                    {ind.label}
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="text-[10px] font-bold text-on-surface-variant/70 text-center leading-none">
                    +{extraCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Next Month Overflow Days */}
        {nextOverflowDays.map((d) => (
          <div
            key={`next-${d}`}
            className="h-24 p-2 rounded-xl bg-background-canvas/30 text-on-surface-variant/20 text-xs font-medium pointer-events-none opacity-40 select-none"
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
