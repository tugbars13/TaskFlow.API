import Card from "@/components/ui/Card";

const ACTIONS = Object.freeze([
  {
    id: "new-task",
    label: "Create Task",
    icon: "add_task",
    color:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary",
  },
  {
    id: "schedule-meeting",
    label: "Schedule Sync",
    icon: "calendar_add_on",
    color:
      "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-on-secondary",
  },
  {
    id: "ai-summary",
    label: "AI Briefing",
    icon: "auto_awesome",
    color:
      "bg-tertiary-container/20 text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary",
  },
  {
    id: "invite-team",
    label: "Invite Member",
    icon: "person_add",
    color:
      "bg-surface-container-high text-on-surface group-hover:bg-on-surface group-hover:text-surface",
  },
]);
export default function QuickActions({ onAction }) {
  return (
    <Card className="apple-shadow p-lg rounded-2xl border border-outline-variant/10">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary text-[22px]">
            flash_on
          </span>
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            aria-label={action.label}
            onClick={() => onAction?.(action.id)}
            className="group flex flex-col items-center justify-center h-24 p-md rounded-2xl bg-surface-container-low/60 hover:bg-surface-container-lowest border border-outline-variant/10 transition-all duration-200 ease-out apple-shadow-hover active:scale-[0.98] cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-xs transition-colors duration-200 ${action.color}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {action.icon}
              </span>
            </div>
            <span className="font-label-md text-xs text-on-surface group-hover:text-primary font-semibold transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
