export const TASK_STATUS_CONFIG = {
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-500",
    strokeColor: "#10b981",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-primary",
    strokeColor: "#7C3AED",
  },
  TODO: {
    label: "To Do",
    color: "bg-purple-400",
    strokeColor: "#c084fc",
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
