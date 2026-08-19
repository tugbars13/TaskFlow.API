import { useState, useEffect } from "react";
import { getTeamAnalytics } from "@/features/teams/api/teamService";
import CalendarPopover from "./CalendarPopover";

export default function TeamAnalyticsView({ team, onBack }) {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTeamAnalytics(team.id, period, date);
        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Analiz verileri yüklenirken hata oluştu.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [team.id, period, date]);

  const getDisplayDate = () => {
    if (!date) return "";
    const dt = new Date(date);

    if (period === "daily") {
      return dt.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (period === "monthly") {
      return dt.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    }
    if (period === "weekly") {
      const day = dt.getDay();
      const diff = day === 0 ? 6 : day - 1; // Mon=0
      const start = new Date(dt);
      start.setDate(dt.getDate() - diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return (
        start.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) +
        " - " +
        end.toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
    return dt.toLocaleDateString("tr-TR");
  };

  // Handle literal placeholder from backend
  const safeAiSummary =
    data?.aiSummary &&
    (data.aiSummary.includes("{data.") || data.aiSummary.includes("{"))
      ? null
      : data?.aiSummary;

  return (
    <div className="w-full flex flex-col gap-lg animate-fade-in pb-xl">
      {/* 3. ÜST HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/10 pb-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
              title="Takımlara Dön"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
            </button>
            <h1 className="font-display-lg text-display-lg font-extrabold text-on-surface tracking-tight">
              Takım Analizi
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant ml-11">
            {team.name}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Date Picker Popover */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-3 py-1.5 text-sm font-bold text-on-surface bg-surface-container-low hover:bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                calendar_month
              </span>
              {getDisplayDate()}
            </button>

            {showCalendar && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCalendar(false)}
                ></div>
                <CalendarPopover
                  selectedDate={date}
                  period={period}
                  onSelect={(d) => setDate(d)}
                  onClose={() => setShowCalendar(false)}
                />
              </>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 shadow-sm">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  period === p
                    ? "bg-surface text-on-surface shadow-sm apple-shadow"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {p === "daily"
                  ? "Günlük"
                  : p === "weekly"
                    ? "Haftalık"
                    : "Aylık"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px] animate-spin mb-4 text-primary">
            progress_activity
          </span>
          <p className="text-sm font-bold">Analiz verileri hesaplanıyor...</p>
        </div>
      ) : error ? (
        <div className="bg-error/10 border border-error/20 p-lg rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-error text-[40px] mb-2">
            error
          </span>
          <p className="text-error font-bold mb-4">{error}</p>
          <button
            onClick={() => setPeriod(period)}
            className="px-4 py-2 bg-error text-on-error rounded-xl font-bold text-sm hover:opacity-90"
          >
            Tekrar Dene
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* 4. METRİK KARTLARI */}
          <MetricCard
            title="Tamamlanan Görevler"
            value={data.completedTasks || 0}
            icon="task_alt"
            color="text-emerald-600"
            bg="bg-emerald-500/10"
          />
          <MetricCard
            title="Devam Eden Görevler"
            value={data.inProgressTasks || 0}
            icon="pending_actions"
            color="text-amber-600"
            bg="bg-amber-500/10"
          />
          <MetricCard
            title="Geciken Görevler"
            value={data.overdueTasks || 0}
            icon="alarm_off"
            color="text-error"
            bg="bg-error/10"
          />
          <MetricCard
            title="Tamamlama Oranı"
            value={`%${data.completionRate || 0}`}
            icon="pie_chart"
            color="text-primary"
            bg="bg-primary/10"
            trend={
              (data.completionRate || 0) -
              (data.previousPeriodCompletionRate || 0)
            }
          />

          {/* 5. İLERLEME TRENDÃ„Â° */}
          <div className="lg:col-span-3 bg-surface rounded-2xl border border-outline-variant/20 p-lg shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                trending_up
              </span>
              İlerleme Trendi
            </h3>
            <div className="w-full h-[250px] flex flex-col relative px-4 pb-2 pt-6">
              {data.progressTrend && data.progressTrend.length > 0 ? (
                (() => {
                  const pts = data.progressTrend.map((item, i, arr) => {
                    const n = arr.length;
                    const padding = 40;
                    const usableWidth = 1000 - 2 * padding;
                    const x =
                      n > 1 ? padding + (i / (n - 1)) * usableWidth : 500;
                    const y = 180 - ((item.completionRate || 0) / 100) * 140;
                    return {
                      x,
                      y,
                      value: item.completionRate || 0,
                      label: item.label,
                    };
                  });

                  let pathD = "";
                  if (pts.length > 0) {
                    pathD = `M ${pts[0].x},${pts[0].y}`;
                    for (let i = 0; i < pts.length - 1; i++) {
                      const cpX = (pts[i + 1].x - pts[i].x) / 3;
                      pathD += ` C ${pts[i].x + cpX},${pts[i].y} ${pts[i + 1].x - cpX},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
                    }
                  }
                  const areaD =
                    pts.length > 0
                      ? `${pathD} L ${pts[pts.length - 1].x},200 L ${pts[0].x},200 Z`
                      : "";
                  const lastPt = pts.length > 0 ? pts[pts.length - 1] : null;

                  return (
                    <>
                      {/* Y-Axis lines & labels */}
                      <div className="absolute inset-0 z-0 flex flex-col justify-between pointer-events-none px-4 pb-8 pt-6">
                        {[100, 50, 0].map((val) => (
                          <div
                            key={val}
                            className="flex items-center w-full border-b border-outline-variant/10 relative"
                          >
                            <span className="absolute -left-2 -translate-x-full text-[10px] font-bold text-on-surface-variant/50">
                              %{val}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* SVG Chart */}
                      <div className="relative z-10 w-full flex-1">
                        <svg
                          viewBox="0 0 1000 200"
                          preserveAspectRatio="none"
                          className="w-full h-full overflow-visible"
                        >
                          {/* Area */}
                          <path d={areaD} className="fill-primary/10" />
                          {/* Smooth Line */}
                          <path
                            d={pathD}
                            fill="none"
                            className="stroke-primary"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Points */}
                          {pts.map((pt, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="6"
                                className="fill-surface stroke-primary group-hover:r-8 transition-all duration-300"
                                strokeWidth="3"
                              />
                              <text
                                x={pt.x}
                                y={pt.y - 15}
                                textAnchor="middle"
                                className="fill-on-surface text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                %{pt.value}
                              </text>
                            </g>
                          ))}
                          {/* Last point persistent label */}
                          {lastPt && (
                            <g>
                              <rect
                                x={lastPt.x - 20}
                                y={lastPt.y - 32}
                                width="40"
                                height="20"
                                rx="10"
                                className="fill-primary"
                              />
                              <text
                                x={lastPt.x}
                                y={lastPt.y - 18}
                                textAnchor="middle"
                                className="fill-on-primary text-[11px] font-bold"
                              >
                                %{lastPt.value}
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>

                      {/* X-Axis labels */}
                      <div className="w-full h-6 mt-2 relative z-10">
                        {pts.map((pt, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold text-on-surface-variant truncate text-center w-12 absolute"
                            style={{
                              left: `${(pt.x / 1000) * 100}%`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            {pt.label}
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-on-surface-variant relative z-10">
                  Henüz veri yok
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-md">
            {/* 8. AI TAKIM ÖZETİ */}
            <div className="flex-1 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-lg shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-primary/10">
                <span className="material-symbols-outlined text-[100px]">
                  auto_awesome
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    auto_awesome
                  </span>
                  AI Takım Özeti
                </h3>
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {safeAiSummary || "Bu dönem için AI özeti oluşturulamadı."}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/20 p-lg shadow-sm">
            {/* 6. EN AKTİF ÜYELER */}
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                groups
              </span>
              En Aktif Üyeler
            </h3>
            <div className="space-y-4">
              {data.activeMembers && data.activeMembers.length > 0 ? (
                data.activeMembers.map((member, i) => (
                  <div key={member.userId} className="flex items-center gap-4">
                    <div className="w-6 text-center text-sm font-bold text-on-surface-variant">
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {member.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="w-32 truncate">
                      <p className="text-sm font-bold text-on-surface truncate">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {member.totalTasks} Görev
                      </p>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{
                            width: `${member.totalTasks > 0 ? (member.completedTasks / member.totalTasks) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-auto flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 text-right">
                        <div className="text-xs font-bold text-primary">
                          {member.completedTasks}{" "}
                          <span className="text-on-surface-variant font-medium">
                            Biten
                          </span>
                        </div>
                        <div className="text-xs font-bold text-amber-600">
                          {member.inProgressTasks}{" "}
                          <span className="text-on-surface-variant font-medium">
                            Devam
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-on-surface-variant">
                  Bu dönemde aktif üye bulunmuyor.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/20 p-lg shadow-sm">
            {/* 7. GECİKEN GÖREVLER */}
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">
                alarm_off
              </span>
              Geciken Görevler
            </h3>
            <div className="space-y-3">
              {data.overdueTasksList && data.overdueTasksList.length > 0 ? (
                data.overdueTasksList.map((task) => (
                  <div
                    key={task.taskId}
                    className="bg-surface-container-lowest border border-error/20 p-3 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-bold text-on-surface truncate"
                        title={task.title}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs font-medium text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[12px]">
                          person
                        </span>
                        <span className="truncate">
                          {task.assigneeName || "Atanmamış"}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 bg-error/10 text-error px-2 py-1 rounded-lg text-xs font-bold">
                      {task.overdueDays} gün
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-[32px] text-emerald-500/50 mb-2">
                    check_circle
                  </span>
                  <p className="text-sm font-medium text-on-surface-variant">
                    Bu dönemde geciken görev bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({ title, value, icon, color, bg, trend }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/20 p-5 shadow-sm hover:apple-shadow transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-error/10 text-error"}`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trend >= 0 ? "arrow_upward" : "arrow_downward"}
            </span>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-on-surface-variant mb-1">
          {title}
        </h4>
        <div className="text-3xl font-black text-on-surface">{value}</div>
        {trend !== undefined && (
          <p className="text-xs font-medium text-on-surface-variant mt-2">
            önceki döneme göre
          </p>
        )}
      </div>
    </div>
  );
}
