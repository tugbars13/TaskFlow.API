import Card from "@/components/ui/Card";

const ACTIVITIES = [
  {
    id: "act-1",
    user: "Alex Rivera",
    action: "completed task",
    target: "UI Token Typography Hierarchy",
    time: "10 mins ago",
    icon: "task_alt",
    iconBg: "bg-green-500/10 text-green-600",
  },
  {
    id: "act-2",
    user: "Sarah Chen",
    action: "commented on",
    target: "Sprint 42 Retrospective Notes",
    time: "45 mins ago",
    icon: "chat_bubble_outline",
    iconBg: "bg-secondary/10 text-secondary",
  },
  {
    id: "act-3",
    user: "Marcus Vance",
    action: "created pull request",
    target: "#148 Fix Auth Token Renewal",
    time: "2 hours ago",
    icon: "merge_type",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: "act-4",
    user: "Elena Rostova",
    action: "attached design file",
    target: "Figma_Dashboard_v3.fig",
    time: "4 hours ago",
    icon: "attach_file",
    iconBg: "bg-tertiary-container/20 text-tertiary",
  },
];

export default function RecentActivity() {
  return (
    <Card className="apple-shadow">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md font-semibold text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary">history</span>
          Recent Activity
        </h3>
        <button type="button" className="text-primary font-label-md text-label-md hover:underline cursor-pointer">
          View Log
        </button>
      </div>

      <div className="relative pl-xs">
        <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-outline-variant/20 pointer-events-none" />

        <div className="space-y-md">
          {ACTIVITIES.map((act) => (
            <div key={act.id} className="relative flex items-start gap-md group">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 shrink-0 border border-white dark:border-gray-800 ${act.iconBg}`}>
                <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-body-sm font-body-sm text-on-surface leading-snug truncate">
                  <span className="font-semibold">{act.user}</span>{" "}
                  <span className="text-on-surface-variant font-normal">{act.action}</span>{" "}
                  <span className="font-medium text-primary cursor-pointer hover:underline">{act.target}</span>
                </p>
                <span className="text-xs text-on-surface-variant/70 mt-0.5 block font-label-sm">
                  {act.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
