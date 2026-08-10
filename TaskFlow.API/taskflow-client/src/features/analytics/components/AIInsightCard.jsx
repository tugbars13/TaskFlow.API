import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
export default function AIInsightCard({
  icon = "auto_awesome",
  title = "AI Productivity Insight",
  subtitle = "Smart workspace optimization",
  day = "Wednesday",
  completion = "+24% Completion",
  recommendation = "Complete high-priority tasks before noon to maximize daily output.",
  onGenerateReport,
}) {
  return (
    <Card
      variant="filled"
      className="col-span-12 lg:col-span-4 bg-primary text-on-primary flex flex-col justify-between relative overflow-hidden group min-h-[400px]"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
          <span className="material-symbols-outlined text-[22px] text-white">
            {icon}
          </span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-white leading-none">
            {title}
          </h3>
          <p className="text-[11px] text-white/70 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Short, Concise Insights */}
      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
        {/* Most Productive Day */}
        <div className="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm space-y-1">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider block">
            Most Productive Day
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-white">{day}</span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              {completion}
            </span>
          </div>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm space-y-1">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-300">
              lightbulb
            </span>
            Recommendation
          </span>
          <p className="text-xs font-medium text-white/90 leading-snug">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Button */}
      <Button
        variant="secondary"
        className="mt-4 w-full"
        onClick={onGenerateReport}
      >
        Generate Weekly Report
      </Button>
    </Card>
  );
}
