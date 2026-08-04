export const TASK_STATUS = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_COLORS = {
  Low: "bg-surface-container-high text-on-surface-variant",
  Medium: "bg-secondary/15 text-secondary",
  High: "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  Urgent: "bg-error/15 text-error font-bold",
};

export const TASK_STATUS_COLORS = {
  Backlog: "bg-surface-container-high text-on-surface-variant",
  "To Do": "bg-secondary/10 text-secondary",
  "In Progress": "bg-tertiary-container/20 text-on-tertiary-container",
  Completed: "bg-primary/10 text-primary",
};
