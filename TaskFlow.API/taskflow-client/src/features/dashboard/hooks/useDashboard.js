import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { getDashboardMetrics } from "../api/dashboardService";
import { TaskContext } from "@/features/tasks/context/TaskContext";
import useAuth from "@/features/auth/hooks/useAuth";

export default function useDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const taskCtx = useContext(TaskContext);
  const lastUpdated = taskCtx?.lastUpdated;
  const tasks = taskCtx?.tasks || [];

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latestRequestIdRef = useRef(0);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    const requestId = ++latestRequestIdRef.current;

    setLoading(true);
    setError("");
    try {
      const data = await getDashboardMetrics();

      // Only apply if this is still the latest request
      if (requestId !== latestRequestIdRef.current) return;

      setMetrics(data);
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;

      setError(err.message ?? "Failed to load dashboard metrics.");
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, lastUpdated]);

  const toggleDashboardTask = useCallback(
    async (id) => {
      if (!taskCtx?.toggleTaskStatus) return;

      await taskCtx.toggleTaskStatus(id);
      // Removed await fetchDashboardData() because UI is now reactive from TaskContext
    },
    [taskCtx],
  );

  return {
    metrics,
    recentTasks: tasks,
    highPriorityTasks: metrics?.highPriorityTasks ?? 0,
    loading: loading && !tasks.length, // Let it show if tasks are loaded
    error,
    refetch: fetchDashboardData,
    toggleDashboardTask,
  };
}
