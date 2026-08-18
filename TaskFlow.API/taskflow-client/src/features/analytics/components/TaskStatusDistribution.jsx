import { useMemo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { TASK_STATUS_CONFIG } from "@/constants/taskStatusConstants";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { calculateTaskStatus } from "@/features/analytics/utils/taskStatus.utils";
import { DONUT_CHART } from "@/features/analytics/constants/chart.constants";

export default function TaskStatusDistribution() {
  const activeTasks = useAnalyticsTasks();
  const actualTaskCount = activeTasks.length;
  const totalTasks = Math.max(actualTaskCount, 1);

  const statusItems = useMemo(() => {
    const { completed, inProgress, todo, backlog } =
      calculateTaskStatus(activeTasks);

    return [
      {
        label: TASK_STATUS_CONFIG.COMPLETED.label,
        count: completed,
        pct: Math.round((completed / totalTasks) * 100),
        color: TASK_STATUS_CONFIG.COMPLETED.color,
        strokeColor: TASK_STATUS_CONFIG.COMPLETED.strokeColor,
      },
      {
        label: TASK_STATUS_CONFIG.IN_PROGRESS.label,
        count: inProgress,
        pct: Math.round((inProgress / totalTasks) * 100),
        color: TASK_STATUS_CONFIG.IN_PROGRESS.color,
        strokeColor: TASK_STATUS_CONFIG.IN_PROGRESS.strokeColor,
      },
      {
        label: TASK_STATUS_CONFIG.TODO.label,
        count: todo,
        pct: Math.round((todo / totalTasks) * 100),
        color: TASK_STATUS_CONFIG.TODO.color,
        strokeColor: TASK_STATUS_CONFIG.TODO.strokeColor,
      },
      {
        label: TASK_STATUS_CONFIG.BACKLOG.label,
        count: backlog,
        pct: Math.round((backlog / totalTasks) * 100),
        color: TASK_STATUS_CONFIG.BACKLOG.color,
        strokeColor: TASK_STATUS_CONFIG.BACKLOG.strokeColor,
      },
    ];
  }, [activeTasks, totalTasks]);

  // Slices for the SVG Donut
  const donutSlices = useMemo(() => {
    let currentOffset = 0;
    return statusItems
      .filter((item) => item.pct > 0)
      .map((item) => {
        const strokeLength = (item.pct * DONUT_CHART.CIRCUMFERENCE) / 100;
        const slice = {
          ...item,
          strokeDasharray: `${strokeLength} ${DONUT_CHART.CIRCUMFERENCE}`,
          strokeDashoffset: -currentOffset,
        };
        currentOffset += strokeLength;
        return slice;
      });
  }, [statusItems]);

  return (
    <Card variant="default" className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-outline-variant/10 shrink-0">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            donut_large
          </span>
          Task Status Distribution
        </h3>
        <Badge className="bg-surface-container-high text-on-surface-variant font-bold shrink-0 ml-3">
          {actualTaskCount} Total Tasks
        </Badge>
      </div>

      {/* Content Body: Centered vertically */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] xl:grid-cols-[130px_1fr] gap-4 md:gap-6 items-center w-full">
          {/* Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg 
              viewBox="0 0 160 160" 
              className="w-full max-w-[130px] aspect-square -rotate-90 drop-shadow-sm mx-auto"
            >
              <circle
                className="fill-none stroke-surface-container-highest/40"
                cx={DONUT_CHART.CENTER}
                cy={DONUT_CHART.CENTER}
                r={DONUT_CHART.RADIUS}
                strokeWidth={DONUT_CHART.STROKE_WIDTH}
              />

              {donutSlices.map((slice) => (
                <circle
                  key={slice.label}
                  className="fill-none transition-all duration-1000"
                  cx={DONUT_CHART.CENTER}
                  cy={DONUT_CHART.CENTER}
                  r={DONUT_CHART.RADIUS}
                  strokeWidth={DONUT_CHART.STROKE_WIDTH}
                  stroke={slice.strokeColor}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl xl:text-3xl font-extrabold text-on-surface tracking-tight">
                {actualTaskCount}
              </span>
              <span className="text-[9px] xl:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 xl:mt-1">
                Total Tasks
              </span>
            </div>
          </div>

          {/* Status Legend Rows */}
          <div className="flex flex-col gap-2.5">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2.5 lg:p-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest hover:bg-surface-container-low hover:border-outline-variant/20 transition-all group gap-2"
              >
                {/* Left: Dot & Label */}
                <div className="flex items-center gap-2.5 whitespace-nowrap">
                  <span
                    className={`w-3 h-3 rounded-full ${item.color} shadow-sm shrink-0`}
                  />
                  <span className="font-semibold text-[11px] lg:text-xs text-on-surface group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </div>

                {/* Right: Count & Percentage */}
                <div className="flex items-center gap-2 lg:gap-4 shrink-0 ml-auto">
                  <span className="text-[10px] lg:text-[11px] text-on-surface-variant font-medium whitespace-nowrap">
                    {item.count} {item.count === 1 ? "Task" : "Tasks"}
                  </span>
                  <span className="font-extrabold text-[11px] lg:text-xs text-on-surface w-7 lg:w-8 text-right">
                    {item.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
