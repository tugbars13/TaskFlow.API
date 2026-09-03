import { ROUTES } from "@/constants/routesConstants";
import { cn } from "@/utils/cn";
import DashboardSectionHeader from "./DashboardSectionHeader";

const PRIORITY_DOT = {
  High: "bg-red-500",
  Medium: "bg-amber-400",
  Low: "bg-gray-300",
};

const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

function PriorityRow({ task, navigate }) {
  return (
    <div
      onClick={() => navigate(ROUTES.TASKS)}
      className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container/30 transition-colors cursor-pointer"
    >
      <div
        className={cn(
          "size-2 rounded-full shrink-0 mt-0.5",
          PRIORITY_DOT[task.priority] ?? "bg-gray-300",
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-on-surface truncate">
          {task.title}
        </div>
        <div className="text-[11px] text-on-surface-variant mt-0.5">
          {task.teamName ?? task.category ?? "GÃ¶rev"}
          {task.dueDate && (
            <span className="ml-2 text-on-surface-variant/40">
              Â·{" "}
              {new Date(task.dueDate).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
      {task.status && (
        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/20 capitalize">
          {task.status}
        </span>
      )}
    </div>
  );
}

export default function PriorityTasksList({ recentTasks, navigate }) {
  const priorityTasks = [...(recentTasks || [])]
    .filter((t) => !t.isCompleted)
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0),
    )
    .slice(0, 5);

  return (
    <div className="col-span-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[16px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            today
          </span>
          <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
            BugÃ¼nÃ¼n Ã–ncelikleri
          </h2>
        </div>
        <button
          onClick={() => navigate(ROUTES.TASKS)}
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          TÃ¼mÃ¼nÃ¼ GÃ¶r
        </button>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {priorityTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <span className="material-symbols-outlined text-[24px] text-on-surface-variant/30 mb-2">
              inventory_2
            </span>
            <p className="text-[13px] text-on-surface-variant/50">
              Bekleyen Ã¶ncelikli gÃ¶rev yok
            </p>
          </div>
        ) : (
          priorityTasks.map((task) => (
            <PriorityRow key={task.id} task={task} navigate={navigate} />
          ))
        )}
      </div>
    </div>
  );
}
