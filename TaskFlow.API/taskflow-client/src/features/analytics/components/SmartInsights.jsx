import { useMemo } from "react";
import Card from "@/components/ui/Card";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { TASK_STATUS_VALUE } from "@/constants/taskStatusConstants";

export default function SmartInsights({ insight, completionTrend = [] }) {
  const displayInsight = insight || "Henüz yeterli çalışma verisi bulunmuyor.";
  const activeTasks = useAnalyticsTasks();

  const { overdueCount, completedThisWeek } = useMemo(() => {
    const now = new Date();

    const overdue = activeTasks.filter((t) => {
      const isCompleted =
        t.isCompleted || TASK_STATUS_VALUE.COMPLETED.includes(t.status);
      if (isCompleted || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const weekCompleted = completionTrend.reduce(
      (sum, day) => sum + (day.completed ?? 0),
      0,
    );

    return { overdueCount: overdue, completedThisWeek: weekCompleted };
  }, [activeTasks, completionTrend]);

  return (
    <Card
      variant="filled"
      className="col-span-12 lg:col-span-4 flex flex-col relative overflow-hidden group"
      style={{
        background:
          "linear-gradient(145deg, #D22B2B 0%, #C12424 40%, #A91E1E 80%, #8B1A1A 100%)",
        color: "#ffffff",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-[90px] bg-white/8 group-hover:bg-white/12 transition-all duration-700 pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full blur-[100px] bg-black/10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/8 group-hover:bg-white/14 transition-colors duration-300">
          <span className="material-symbols-outlined text-[20px] text-white/90">
            tips_and_updates
          </span>
        </div>
        <div>
          <h3 className="font-headline-md text-[15px] font-bold text-white leading-none tracking-tight">
            Smart Insights
          </h3>
          <p className="text-[10px] text-white/50 mt-0.5 font-medium tracking-wide">
            Data-driven workspace analysis
          </p>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="relative z-10 flex flex-col gap-3">
        <div
          className="p-4 rounded-xl border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Label */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/45 uppercase tracking-widest mb-2.5">
            <span className="material-symbols-outlined text-[14px] text-amber-300/70">
              auto_awesome
            </span>
            AI Analysis
          </span>

          {/* Insight text */}
          <p className="text-[13.5px] font-medium text-white/90 leading-[1.7]">
            {displayInsight}
          </p>
        </div>

        {/* Metrics Footer */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-0 px-1"
        >
          {/* Overdue metric */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="size-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-white/60">
                schedule
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[20px] font-bold text-white leading-none">
                {overdueCount}
              </span>
              <p className="text-[10px] text-white/45 font-medium mt-0.5 truncate">
                Aktif gecikmiş görev
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-white/10 mx-3 shrink-0" />
          <div className="block sm:hidden h-px w-full bg-white/10" />

          {/* Weekly completion metric */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="size-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-emerald-300/70">
                trending_up
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[20px] font-bold text-white leading-none">
                {completedThisWeek}
              </span>
              <p className="text-[10px] text-white/45 font-medium mt-0.5 truncate">
                Bu hafta tamamlanan
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
