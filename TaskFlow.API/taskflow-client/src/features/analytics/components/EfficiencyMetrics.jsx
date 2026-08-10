import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import { DEFAULT_EFFICIENCY_METRICS } from "@/constants/analyticsConstants";
export default function EfficiencyMetrics({ metrics }) {
  const data = metrics ?? DEFAULT_EFFICIENCY_METRICS;
  const metricItems = useMemo(
    () => [
      {
        label: "Avg. Completion Time",
        value: data.avgCompletionTime,
        delta: data.completionDelta,
        deltaClass: "text-status-progress",
      },
      {
        label: "Focus Score",
        value: data.focusScore,
        delta: data.focusDelta,
        deltaClass: "text-secondary",
      },
      {
        label: "Task Bounce Rate",
        value: data.taskBounceRate,
        delta: data.bounceDelta,
        deltaClass: "text-status-error",
      },
      {
        label: "Meetings vs Focus",
        value: data.meetingsRatio,
        delta: data.meetingsDelta,
        deltaClass: "text-outline",
      },
    ],
    [data],
  );
  return (
    <Card variant="default" className="col-span-12 mb-xl">
      <div className="mb-lg">
        <h3 className="font-headline-md text-headline-md font-semibold">
          Efficiency Metrics
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {metricItems.map((item) => (
          <Card key={item.label} padding="md" variant="filled">
            <span className="text-label-sm text-on-surface-variant block mb-2 uppercase">
              {item.label}
            </span>

            <div className="flex items-end gap-sm">
              <span className="text-headline-lg font-bold">{item.value}</span>

              <span
                className={cn("font-bold text-body-sm mb-1", item.deltaClass)}
              >
                {item.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
