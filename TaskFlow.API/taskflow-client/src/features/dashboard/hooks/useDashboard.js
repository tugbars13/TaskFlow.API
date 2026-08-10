import { useEffect, useState, useCallback, useContext } from "react";
import { getDashboardMetrics } from "../api/dashboardService";
import { TaskContext } from "@/features/tasks/context/TaskContext";

export default function useDashboard() {
  const taskCtx = useContext(TaskContext);
  const lastUpdated = taskCtx?.lastUpdated;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message ?? "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, lastUpdated]);

  const toggleDashboardTask = useCallback(
    async (id) => {
      if (!taskCtx?.toggleTaskStatus) return;

      await taskCtx.toggleTaskStatus(id);
      await fetchDashboardData();
    },
    [taskCtx, fetchDashboardData],
  );

  return {
    metrics,
    todayPriorities: metrics?.todayPriorities ?? [],
    highPriorityTasks: metrics?.highPriorityTasks ?? 0,
    loading,
    error,
    refetch: fetchDashboardData,
    toggleDashboardTask,
  };
}
