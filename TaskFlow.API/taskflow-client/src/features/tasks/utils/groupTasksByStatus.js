const getCleanStatus = (statusStr) => {
  return String(statusStr ?? "")
    .toLowerCase()
    .replace(/[_\s]/g, "");
};

export default function groupTasksByStatus(tasks = []) {
  const backlog = [];
  const todo = [];
  const inProgress = [];
  const completed = [];

  tasks.forEach((task) => {
    const status = getCleanStatus(task.status);

    if (task.isCompleted || status === "completed" || status === "4") {
      completed.push(task);
    } else if (status === "inprogress" || status === "3") {
      inProgress.push(task);
    } else if (status === "todo" || status === "2") {
      todo.push(task);
    } else {
      backlog.push(task);
    }
  });

  return {
    backlog,
    todo,
    inProgress,
    completed,
  };
}
