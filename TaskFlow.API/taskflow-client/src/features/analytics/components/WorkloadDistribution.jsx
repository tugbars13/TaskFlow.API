import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/utils/cn";
import { getWorkloadLevel } from "@/features/analytics/utils/workloadUtils";
export default function WorkloadDistribution({ teamWorkload = [] }) {
  const members = teamWorkload;

  return (
    <Card variant="default" className="col-span-12 lg:col-span-6">
      <h3 className="font-headline-md text-headline-md font-semibold mb-md">
        Team Workload Distribution
      </h3>
      <div className="space-y-lg">
        {members.length === 0 ? (
          <div className="p-md text-center text-xs text-on-surface-variant bg-surface-container-low/40 rounded-xl">
            No team workload data available.
          </div>
        ) : (
          members.map((member, idx) => {
            const workload = getWorkloadLevel(member.capacity);

            return (
              <div key={member.id || idx} className="space-y-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-sm">
                    <div className="size-8 rounded-full bg-surface-container-high overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={member.avatar}
                        alt={member.name}
                      />
                    </div>

                    <span className="font-label-md">{member.name}</span>
                  </div>

                  <span className={cn("text-body-sm font-bold", workload.text)}>
                    {member.capacity}% Capacity
                  </span>
                </div>

                <ProgressBar
                  value={member.capacity}
                  barClassName={workload.bar}
                />

                <div className="flex justify-between text-label-sm text-on-surface-variant">
                  <span>{member.activeTasks} Active Tasks</span>
                  <span>{member.overdueTasks} Overdue</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
