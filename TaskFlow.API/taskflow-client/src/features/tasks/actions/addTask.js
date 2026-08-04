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
        setTasks((prev) => [normalizeTask(created), ...prev]);
    } else {
        await loadTasks(currentTeamId);
    }

    notifyChange();
}