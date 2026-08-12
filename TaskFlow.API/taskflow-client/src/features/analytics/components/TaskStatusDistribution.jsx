import { useMemo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { TASK_STATUS_CONFIG } from "@/constants/taskStatusConstants";
import useAnalyticsTasks from "@/features/analytics/hooks/useAnalyticsTasks";
import { calculateTaskStatus } from "@/features/analytics/utils/taskStatus.utils";
import { DONUT_CHART } from "@/features/analytics/constants/chart.constants";
export default function TaskStatusDistribution() {
  const activeTasks = useAnalyticsTasks();

  const totalTasks = Math.max(activeTasks.length, 1);

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
  const completedStatus = statusItems.find(
    (item) => item.label === TASK_STATUS_CONFIG.COMPLETED.label,
  );
  return (
    <Card variant="default" className="col-span-12 md:col-span-6 lg:col-span-4">
      <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4 h-8">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">
            donut_large
          </span>
          Task Status Distribution
        </h3>
        <Badge className="bg-surface-container-high text-on-surface-variant font-bold">
          {activeTasks.length} Total Tasks
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* SVG Donut Chart Viz */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-40 h-40 -rotate-90">
            <circle
              className="fill-none stroke-surface-container-high"
              cx={DONUT_CHART.CENTER}
              cy={DONUT_CHART.CENTER}
              r={DONUT_CHART.RADIUS}
              strokeWidth={DONUT_CHART.STROKE_WIDTH}
            />

            <circle
              className="fill-none transition-all duration-1000"
              cx={DONUT_CHART.CENTER}
              cy={DONUT_CHART.CENTER}
              r={DONUT_CHART.RADIUS}
              strokeWidth={DONUT_CHART.STROKE_WIDTH}
              stroke={completedStatus?.strokeColor}
              strokeDasharray={DONUT_CHART.CIRCUMFERENCE}
              strokeDashoffset={
                DONUT_CHART.CIRCUMFERENCE -
                (DONUT_CHART.CIRCUMFERENCE * (completedStatus?.pct ?? 0)) / 100
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-on-surface">
              {activeTasks.length}
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Tasks
            </span>
          </div>
        </div>

        {/* Status Breakdown Legend List */}
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-3 h-3 rounded-full ${item.color} shrink-0`}
                />
                <span className="font-semibold text-on-surface truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-on-surface-variant font-medium">
                  {item.count} Tasks
                </span>
                <span className="font-bold text-on-surface min-w-[36px] text-right">
                  {item.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
