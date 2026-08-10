import { createTask } from "@/features/tasks/api/taskService";
import normalizeTask from "../utils/normalizeTask";

export default async function addTaskAction({
  newTaskData,
  currentTeamId,
  setTasks,
  loadTasks,
  notifyChange,
}) {
  const created = await createTask({
    ...newTaskData,
    teamId: currentTeamId,
  });

  if (created?.id) {
    const normalizedTask = normalizeTask(created);

    setTasks((prev) => [normalizedTask, ...prev]);
  } else {
    await loadTasks(currentTeamId);
  }

  notifyChange();
}
