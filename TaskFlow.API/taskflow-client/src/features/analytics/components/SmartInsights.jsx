import Card from "@/components/ui/Card";

export default function SmartInsights({ insight }) {
  const displayInsight = insight || "Henüz yeterli çalışma verisi bulunmuyor.";

  return (
    <Card
      variant="filled"
      className="col-span-12 lg:col-span-4 bg-primary text-on-primary flex flex-col relative overflow-hidden group min-h-[400px]"
    >
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
          <span className="material-symbols-outlined text-[22px] text-white">
            tips_and_updates
          </span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-white leading-none">
            Smart Insights
          </h3>
          <p className="text-[11px] text-white/70 mt-1">Data-driven workspace analysis</p>
        </div>
      </div>

      {/* Insight Display */}
      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
        <div className="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm space-y-1">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[16px] text-amber-300">
              auto_awesome
            </span>
            AI Analysis
          </span>
          <p className="text-sm font-medium text-white/90 leading-snug">
            {displayInsight}
          </p>
        </div>
      </div>
    </Card>
  );
}
