import { formatDateDDMMYYYY } from "@/utils/dateUtils";

function DetailRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-sm py-sm">
      <span className="material-symbols-outlined text-outline">
        {icon}
      </span>

      <span className="text-body-sm text-on-surface-variant">
        {label}
      </span>

      <span className="ml-auto text-body-sm text-on-surface font-medium">
        {value}
      </span>
    </div>
  );
}

export default function TaskDetailsView({ task }) {
  if (!task) return null;

  const formattedDueDate = task.dueDate
    ? formatDateDDMMYYYY(task.dueDate)
    : null;

  const detailItems = [
    {
      icon: "flag",
      label: "Status",
      value: task.isCompleted ? "Completed" : "In Progress",
    },
    {
      icon: "label",
      label: "Category",
      value: task.category,
    },
    {
      icon: "priority_high",
      label: "Priority",
      value: task.priority,
    },
    {
      icon: "event",
      label: "Due Date",
      value: formattedDueDate,
    },
    {
      icon: "person",
      label: "Assignee",
      value: task.assignedUserFullName,
    },
    {
      icon: "group",
      label: "Team",
      value: task.teamName,
    },
  ];

  return (
    <div className="space-y-md">
      {task.description && (
        <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      <div className="divide-y divide-outline-variant/10 border-t border-outline-variant/10 pt-xs">
        {detailItems.map((item) => (
          <DetailRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}
