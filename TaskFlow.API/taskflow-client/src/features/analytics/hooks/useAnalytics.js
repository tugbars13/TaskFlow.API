import { useEffect, useState, useCallback } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getAnalyticsMetrics } from "@/features/analytics/api/analyticsService";
import { ERROR_MESSAGES } from "@/constants/errorConstants";
export default function useAnalytics() {
  const { lastUpdated } = useTasks();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsMetrics();
      setMetrics(data);
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.ANALYTICS_LOAD_FAILED);
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
