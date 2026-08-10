import { useCallback, useRef } from "react";
import { getTasks } from "../api/taskService";
import normalizeTask from "../utils/normalizeTask";

export default function useTaskLoader({
  setTasks,
  setLoading,
  setError,
}) {
  const latestRequestIdRef = useRef(0);

  const loadTasks = useCallback(async (teamId = null) => {
    const requestId = ++latestRequestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await getTasks(teamId);
      
      if (requestId !== latestRequestIdRef.current) return;

      const rawTasks = Array.isArray(data) ? data : [];
      setTasks(rawTasks.map(normalizeTask));
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;

      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks.");
      setTasks([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [setTasks, setLoading, setError]);

  return { loadTasks };
}