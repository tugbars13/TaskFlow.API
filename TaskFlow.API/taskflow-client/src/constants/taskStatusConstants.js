export const TASK_STATUS_CONFIG = {
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-500",
    strokeColor: "#10b981",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-primary",
    strokeColor: "#D22B2B",
  },
  TODO: {
    label: "To Do",
    color: "bg-secondary",
    strokeColor: "#9CA3AF",
  },
  BACKLOG: {
    label: "Backlog",
    color: "bg-amber-500",
    strokeColor: "#f59e0b",
  },
};
export const TASK_STATUS_VALUE = {
  BACKLOG: [1, "1", "backlog"],
  TODO: [2, "2", "todo"],
  IN_PROGRESS: [3, "3", "in_progress", "inprogress"],
  COMPLETED: [4, "4", "completed"],
};
