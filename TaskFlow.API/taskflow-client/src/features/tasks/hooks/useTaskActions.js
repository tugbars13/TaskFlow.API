import { useCallback } from "react";
import { createTask, updateTask, deleteTask } from "../api/taskService";
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
  const addTask = useCallback(
    async (newTaskData) => {
      try {
        const created = await createTask({
          teamId: currentTeamId,
          ...newTaskData,
        });
        if (created && created.id) {
          setTasks((prev) => [normalizeTask(created), ...prev]);
        } else {
          await loadTasks(currentTeamId);
        }
        notifyChange();
      } catch (err) {
        console.error("Failed to create task:", err);
        setError("Failed to create task.");
        throw err;
      }
    },
    [currentTeamId, loadTasks, notifyChange, setError, setTasks],
  );

  const editTask = useCallback(
    async (id, updatedFields) => {
      const targetTask = tasks.find((t) => t.id === id);

      if (!targetTask) return;

      const fullTaskData = {
        ...targetTask,
        ...updatedFields,
      };

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
      );

      notifyChange();

      try {
        await updateTask(id, fullTaskData);
      } catch (err) {
        console.error("Failed to update task, rolling back:", err);
        setError("Failed to update task.");
        await loadTasks(currentTeamId);
        notifyChange();
      }
    },
    [tasks, currentTeamId, loadTasks, notifyChange, setError, setTasks],
  );

  const removeTask = useCallback(
    async (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      notifyChange();

      try {
        await deleteTask(id);
      } catch (err) {
        console.error("Failed to delete task, rolling back:", err);
        setError("Failed to delete task.");
        await loadTasks(currentTeamId);
        notifyChange();
      }
    },
    [currentTeamId, loadTasks, notifyChange, setError, setTasks],
  );

  const toggleTaskStatus = useCallback(
    async (id) => {
      const targetTask = tasks.find((t) => t.id === id);
      if (!targetTask) return;

      const nextCompleted = !targetTask.isCompleted;
      const nextStatus = nextCompleted ? "completed" : "backlog";

      await editTask(id, {
        isCompleted: nextCompleted,
        status: nextStatus,
      });
    },
    [tasks, editTask],
  );

  const moveTaskColumn = useCallback(
    async (id, targetStatusId) => {
      const targetTask = tasks.find((t) => t.id === id);
      if (!targetTask) return;

      const nextStatus = normalizeStatus(
        targetStatusId,
        targetStatusId === "completed",
      );
      const nextCompleted = nextStatus === "completed";

      await editTask(id, {
        status: nextStatus,
        isCompleted: nextCompleted,
      });
    },
    [tasks, editTask],
  );

  return {
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    moveTaskColumn,
  };
}
