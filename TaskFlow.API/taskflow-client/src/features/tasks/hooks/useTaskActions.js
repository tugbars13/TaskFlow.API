import {
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskService";
import normalizeTask from "../utils/normalizeTask";
import normalizeStatus from "../utils/normalizeStatus";
export default function useTaskActions({
  tasks,
  setTasks,
  setError,
  notifyChange,
  loadTasks,
  currentTeamId,
}) {

    const addTask = async (newTaskData) => {
    try {
      const created = await createTask({ ...newTaskData, teamId: currentTeamId });
      if (created && created.id) {
        setTasks((prev) => [normalizeTask(created), ...prev]);
      } else {
        await loadTasks(currentTeamId);
      }
      notifyChange();
    } catch (err) {
      setError("Failed to create task.");
      throw err;
    }
  };
  const editTask = async (id, updatedFields) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
    notifyChange();

    try {
      await updateTask(id, updatedFields);
    } catch (err) {
      setError("Failed to update task.");
      await loadTasks(currentTeamId);
      notifyChange();
    }
  };

  const removeTask = async (id) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    notifyChange();

    try {
      await deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task, rolling back:", err);
      setTasks(previousTasks);
      setError("Failed to delete task.");
      notifyChange();
    }
  };

  const toggleTaskStatus = async (id) => {
    const previousTasks = [...tasks];
    const targetTask = previousTasks.find((t) => t.id === id);
    if (!targetTask) return;

    const nextCompleted = !targetTask.isCompleted;
    const nextStatus = nextCompleted ? "completed" : "backlog";

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: nextCompleted, status: nextStatus } : t))
    );
    notifyChange();

    try {
      await updateTask(id, {
        title: targetTask.title,
        description: targetTask.description,
        priority: targetTask.priority,
        category: targetTask.category,
        dueDate: targetTask.dueDate,
        isCompleted: nextCompleted,
        status: nextStatus,
      });
    } catch (err) {
      console.error("Failed to update task status, rolling back:", err);
      setTasks(previousTasks);
      setError("Failed to update task status.");
      notifyChange();
    }
  };

  const moveTaskColumn = async (id, targetStatusId) => {
    const previousTasks = [...tasks];
    const targetTask = previousTasks.find((t) => t.id === id);
    if (!targetTask) return;

    const nextStatus = normalizeStatus(targetStatusId, targetStatusId === "completed");
    const nextCompleted = nextStatus === "completed";

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus, isCompleted: nextCompleted } : t))
    );
    notifyChange();

    try {
      await updateTask(id, {
        title: targetTask.title,
        description: targetTask.description,
        priority: targetTask.priority,
        category: targetTask.category,
        dueDate: targetTask.dueDate,
        status: nextStatus,
        isCompleted: nextCompleted,
      });
    } catch (err) {
      console.error("Failed to move task column, rolling back:", err);
      setTasks(previousTasks);
      alert("Failed to update task column on backend. Reverted changes.");
      notifyChange();
    }
  };

  return {
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    moveTaskColumn,
  };
}
