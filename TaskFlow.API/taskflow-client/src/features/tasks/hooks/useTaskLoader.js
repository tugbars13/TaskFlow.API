import { useCallback } from "react";
import { getTasks } from "../api/taskService";
import normalizeTask from "../utils/normalizeTask";

export default function useTaskLoader({
  setTasks,
  setLoading,
  setError,
}) {
  const loadTasks = useCallback(async (teamId = null) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTasks(teamId);
      const rawTasks = Array.isArray(data) ? data : [];
      setTasks(rawTasks.map(normalizeTask));
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [setTasks, setLoading, setError]);

  return { loadTasks };
}