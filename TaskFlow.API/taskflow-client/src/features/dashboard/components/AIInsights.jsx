import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AIInsights({
  insight = {
    title: "AI Workload Recommendation",
    summary:
      "You have 3 overlapping tasks scheduled between 2:00 PM - 4:00 PM. Reallocating 'Marketing Review' to tomorrow morning will boost team focus velocity by ~18%.",
    impact: "+18% Velocity",
    actionText: "Auto-Reschedule",
  },
  onApplyAction,
}) {
  return (
    <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-surface-container-lowest via-surface-container-low/30 to-primary/5 apple-shadow">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-md mb-xs">
        <div className="flex items-center gap-xs">
          <div className="p-xs rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
            TaskFlow AI Insights
          </h3>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-semibold px-md py-0.5 rounded-full border border-primary/20">
          {insight?.impact}
        </span>
      </div>

      <p className="text-body-md font-body-md text-on-surface-variant my-md leading-relaxed">
        {insight?.summary}
      </p>

      <div className="flex items-center justify-between pt-xs">
        <span className="text-xs text-outline font-label-sm flex items-center gap-xs">
          <span className="material-symbols-outlined text-[14px]">
            psychology
          </span>
          Updated 15m ago
        </span>
        <Button
          type="button"
          variant="filled"
          onClick={onApplyAction}
          className="text-xs px-md py-xs rounded-xl shadow-sm hover:shadow transition-shadow flex items-center gap-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          {insight?.actionText}
        </Button>
      </div>
    </Card>
  );
}
