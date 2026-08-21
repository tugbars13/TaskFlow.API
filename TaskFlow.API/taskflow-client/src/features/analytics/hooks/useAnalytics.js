import { useEffect, useState, useCallback, useRef } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getAnalyticsMetrics } from "@/features/analytics/api/analyticsService";
import { ERROR_MESSAGES } from "@/constants/errorConstants";
export default function useAnalytics() {
  const { lastUpdated } = useTasks();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const latestRequestIdRef = useRef(0);

  const fetchMetrics = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;

    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsMetrics();

      // Only apply if this is still the latest request
      if (requestId !== latestRequestIdRef.current) return;

      setMetrics(data);
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) return;

      setError(error.message || ERROR_MESSAGES.ANALYTICS_LOAD_FAILED);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
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
