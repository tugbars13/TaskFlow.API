import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

const MEMBERS = [
  {
    id: "m-1",
    name: "Alex Rivera",
    role: "Lead Engineer",
    status: "Active",
    statusColor: "bg-green-500",
    currentTask: "Auth Middleware Refactor",
    progress: 80,
    avatarBg: "bg-primary/20 text-primary",
  },
  {
    id: "m-2",
    name: "Sarah Chen",
    role: "Product Designer",
    status: "Deep Focus",
    statusColor: "bg-purple-500",
    currentTask: "Design System Specs",
    progress: 45,
    avatarBg: "bg-secondary/20 text-secondary",
  },
  {
    id: "m-3",
    name: "Marcus Vance",
    role: "Backend Dev",
    status: "In Meeting",
    statusColor: "bg-amber-500",
    currentTask: "API Endpoint Specs",
    progress: 60,
    avatarBg: "bg-tertiary-container/40 text-tertiary",
  },
];

export default function TeamOverview() {
  return (
    <Card className="apple-shadow">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md font-semibold text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">groups</span>
          Team Workload & Activity
        </h3>
        <button type="button" className="text-primary font-label-md text-label-md hover:underline cursor-pointer">
          Manage Team
        </button>
      </div>

      <div className="space-y-md">
        {MEMBERS.map((member) => (
          <div
            key={member.id}
            className="p-sm md:p-md rounded-xl bg-surface-container-low/40 hover:bg-surface-container-lowest border border-outline-variant/10 transition-colors apple-shadow-hover"
          >
            <div className="flex items-center justify-between gap-md mb-xs">
              <div className="flex items-center gap-md">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full font-semibold text-xs flex items-center justify-center border border-white dark:border-gray-800 ${member.avatarBg}`}>
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${member.statusColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-xs">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                      {member.name}
                    </h4>
                    <span className="text-xs text-on-surface-variant font-normal">
                      • {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-outline truncate max-w-[180px] sm:max-w-[260px]">
                    {member.currentTask}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge className="bg-surface-container-high text-on-surface-variant text-[11px] mb-1">
                  {member.status}
                </Badge>
                <p className="text-xs font-medium text-on-surface-variant">
                  {member.progress}%
                </p>
              </div>
            </div>

            <ProgressBar value={member.progress} barClassName="bg-primary" />
          </div>
        ))}
      </div>
    </Card>
  );
}
