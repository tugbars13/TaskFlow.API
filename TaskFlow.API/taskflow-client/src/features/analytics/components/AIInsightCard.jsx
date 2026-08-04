export default function AIInsightCard() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary p-6 rounded-3xl apple-shadow flex flex-col justify-between relative overflow-hidden group min-h-[400px]">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
          <span className="material-symbols-outlined text-[22px] text-white">auto_awesome</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-white leading-none">
            AI Productivity Insight
          </h3>
          <p className="text-[11px] text-white/70 mt-1">Smart workspace optimization</p>
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
            <span className="text-xl font-extrabold text-white">Wednesday</span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              +24% Completion
            </span>
          </div>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm space-y-1">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-300">lightbulb</span>
            Recommendation
          </span>
          <p className="text-xs font-medium text-white/90 leading-snug">
            Complete high-priority tasks before noon to maximize daily output.
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={() => alert("Generating weekly AI productivity report...")}
        className="mt-4 w-full py-3 bg-white text-primary font-bold text-xs rounded-2xl hover:bg-white/90 transition-all active:scale-95 z-10 cursor-pointer shadow-md"
      >
        Generate Weekly Report
      </button>
    </div>
  );
}
