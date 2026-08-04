import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export default function EfficiencyMetrics({ metrics }) {
  const data = metrics || {
    avgCompletionTime: "1.4d",
    completionDelta: "↓ 12%",
    focusScore: 92,
    focusDelta: "↑ 5%",
    taskBounceRate: "8%",
    bounceDelta: "↑ 2%",
    meetingsRatio: "1:4",
    meetingsDelta: "Stable",
  };

  return (
    <div className="col-span-12 bg-surface p-lg rounded-xl apple-shadow mb-xl">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="font-headline-md text-headline-md font-semibold">Efficiency Metrics</h3>
        <Link to={ROUTES.ANALYTICS} className="text-primary font-label-md hover:underline">
          View Detailed Logs
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span className="text-label-sm text-on-surface-variant block mb-2 uppercase">Avg. Completion Time</span>
          <div className="flex items-end gap-sm">
            <span className="text-headline-lg font-bold">{data.avgCompletionTime}</span>
            <span className="text-status-progress font-bold text-body-sm mb-1">{data.completionDelta}</span>
          </div>
        </div>
        <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span className="text-label-sm text-on-surface-variant block mb-2 uppercase">Focus Score</span>
          <div className="flex items-end gap-sm">
            <span className="text-headline-lg font-bold">{data.focusScore}</span>
            <span className="text-secondary font-bold text-body-sm mb-1">{data.focusDelta}</span>
          </div>
        </div>
        <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span className="text-label-sm text-on-surface-variant block mb-2 uppercase">Task Bounce Rate</span>
          <div className="flex items-end gap-sm">
            <span className="text-headline-lg font-bold">{data.taskBounceRate}</span>
            <span className="text-status-error font-bold text-body-sm mb-1">{data.bounceDelta}</span>
          </div>
        </div>
        <div className="p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span className="text-label-sm text-on-surface-variant block mb-2 uppercase">Meetings vs Focus</span>
          <div className="flex items-end gap-sm">
            <span className="text-headline-lg font-bold">{data.meetingsRatio}</span>
            <span className="text-outline font-bold text-body-sm mb-1">{data.meetingsDelta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
