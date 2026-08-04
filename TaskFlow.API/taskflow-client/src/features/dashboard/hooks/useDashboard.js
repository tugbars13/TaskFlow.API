import { useEffect, useState, useCallback, useContext } from "react";
import { getDashboardMetrics } from "../api/dashboardService";
import { TaskContext } from "@/features/tasks/context/TaskContext";

export default function useDashboard() {
  const taskCtx = useContext(TaskContext);
  const lastUpdated = taskCtx?.lastUpdated;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, lastUpdated]);

  const toggleDashboardTask = async (id) => {
    if (taskCtx && taskCtx.toggleTaskStatus) {
      await taskCtx.toggleTaskStatus(id);
      await fetchDashboardData();
    }
  };

  return {
    data: metrics,
    metrics,
    loading,
    error,
    refetch: fetchDashboardData,
    toggleDashboardTask,
  };
}
