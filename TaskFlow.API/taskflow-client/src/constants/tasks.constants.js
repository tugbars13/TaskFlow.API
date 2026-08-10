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
  [TASK_PRIORITY.LOW]: "bg-surface-container-high text-on-surface-variant",
  [TASK_PRIORITY.MEDIUM]: "bg-secondary/15 text-secondary",
  [TASK_PRIORITY.HIGH]:
    "bg-tertiary-container/30 text-on-tertiary-container font-semibold",
  [TASK_PRIORITY.URGENT]: "bg-error/15 text-error font-bold",
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.BACKLOG]: "bg-surface-container-high text-on-surface-variant",

  [TASK_STATUS.TODO]: "bg-secondary/10 text-secondary",

  [TASK_STATUS.IN_PROGRESS]:
    "bg-tertiary-container/20 text-on-tertiary-container",

  [TASK_STATUS.COMPLETED]: "bg-primary/10 text-primary",
};
