const VIEW_MODES = ["day", "week", "month"];

export default function CalendarControls({
  currentMonthText,
  viewMode = "month",
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onToday,
  onFilterClick,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-extrabold text-primary tracking-tight">
          {currentMonthText}
        </h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Schedules, team availability, and project deadlines.
        </p>
      </div>

      {/* Controls Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View Switcher */}
        <div className="bg-surface-container-lowest p-1 rounded-2xl border border-outline-variant/10 flex items-center apple-shadow">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange?.(mode)}
              className={`px-4 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="bg-surface-container-lowest p-1 rounded-2xl border border-outline-variant/10 flex items-center gap-1 apple-shadow">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
            aria-label="Previous Month"
            title="Previous Month"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
            aria-label="Today"
            title="Today"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
            aria-label="Next Month"
            title="Next Month"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Filter"
          className="bg-surface-container-lowest border border-outline-variant/10 px-4 py-2 rounded-2xl text-xs font-semibold text-on-surface hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1.5 apple-shadow cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            filter_list
          </span>
          Filter
        </button>
      </div>
    </div>
  );
}
