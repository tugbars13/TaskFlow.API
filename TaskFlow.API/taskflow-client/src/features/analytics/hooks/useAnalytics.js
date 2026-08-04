import { useEffect, useState, useCallback, useContext } from "react";
import { getAnalyticsMetrics } from "../api/analyticsService";
import { TaskContext } from "@/features/tasks/context/TaskContext";

export default function useAnalytics() {
  const taskCtx = useContext(TaskContext);
  const lastUpdated = taskCtx?.lastUpdated;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message || "Failed to load analytics metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, lastUpdated]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
