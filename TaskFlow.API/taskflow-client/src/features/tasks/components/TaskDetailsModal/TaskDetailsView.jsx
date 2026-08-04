import { formatDateDDMMYYYY } from "@/utils/dateUtils";
import TaskBadges from "./TaskBadges";

function DetailRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between py-xs">
      <span className="flex items-center gap-xs text-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        {label}
      </span>
      <span className="text-body-sm font-semibold text-on-surface">{value}</span>
    </div>
  );
}

export default function TaskDetailsView({ task }) {
  if (!task) return null;

  return (
    <div className="space-y-lg">
      <TaskBadges tags={task.tags} />

      {task.description && (
        <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      <div className="divide-y divide-outline-variant/10 border-t border-outline-variant/10 pt-xs">
        <DetailRow
          icon="flag"
          label="Status"
          value={task.isCompleted ? "Completed" : "In Progress"}
        />
        <DetailRow icon="label" label="Category" value={task.category} />
        <DetailRow icon="priority_high" label="Priority" value={task.priority} />
        <DetailRow
          icon="event"
          label="Due Date"
          value={task.dueDate ? formatDateDDMMYYYY(task.dueDate) : null}
        />
        <DetailRow icon="person" label="Assignee" value={task.assignedUserFullName} />
        <DetailRow icon="group" label="Team" value={task.teamName} />
      </div>
    </div>
  );
}
