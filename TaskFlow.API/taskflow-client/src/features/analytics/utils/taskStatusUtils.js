import { TASK_STATUS_VALUE } from "@/constants/taskStatusConstants";

export function calculateTaskStatus(tasks) {
  const completed = tasks.filter(
    (t) => t.isCompleted || TASK_STATUS_VALUE.COMPLETED.includes(t.status),
  ).length;

  const inProgress = tasks.filter(
    (t) => !t.isCompleted && TASK_STATUS_VALUE.IN_PROGRESS.includes(t.status),
  ).length;

  const todo = tasks.filter(
    (t) => !t.isCompleted && TASK_STATUS_VALUE.TODO.includes(t.status),
  ).length;

  const backlog = tasks.filter(
    (t) =>
      !t.isCompleted &&
      (TASK_STATUS_VALUE.BACKLOG.includes(t.status) || !t.status),
  ).length;

  return {
    completed,
    inProgress,
    todo,
    backlog,
  };
}
