import Card from "@/components/ui/Card";

export default function ProductivityCard({
  percentage = 75,
  growthText = "+14%",
  insightTitle = "Great schedule discipline!",
  insightSummary = "75% of scheduled meetings and sprint milestones were completed on time without conflict.",
  updatedText = "Updated 15m ago",
  onAnalyticsClick,
}) {
  return (
    <Card className="rounded-3xl p-7 apple-shadow space-y-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          Productivity
        </h3>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {growthText}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-7 py-2">
        {/* Circular Progress (120px) */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-primary/10"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary transition-all duration-1000 ease-out"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-headline-lg text-headline-lg font-extrabold text-primary">
              {percentage}%
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">Completed</span>
          </div>
        </div>

        {/* Short Insight Text */}
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-headline-md text-sm font-semibold text-on-surface">
            {insightTitle}
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {insightSummary}
          </p>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="material-symbols-outlined text-[15px] text-primary">insights</span>
          {updatedText}
        </span>
        <button
          type="button"
          onClick={onAnalyticsClick}
          className="font-semibold text-primary cursor-pointer hover:underline text-xs"
        >
          View Analytics &rarr;
        </button>
      </div>
    </Card>
  );
}
