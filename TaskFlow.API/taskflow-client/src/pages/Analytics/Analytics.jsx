import useAnalytics from "@/features/analytics/hooks/useAnalytics";
import CompletionTrendChart from "@/features/analytics/components/CompletionTrendChart";
import AIInsightCard from "@/features/analytics/components/AIInsightCard";
import TaskStatusDistribution from "@/features/analytics/components/TaskStatusDistribution";
import CategoryBreakdown from "@/features/analytics/components/CategoryBreakdown";

import {
  PageHeader,
  PageLoading,
  PageError,
} from "@/components/common";

export default function Analytics() {
  const { metrics, loading, error, refetch } = useAnalytics();

  if (loading) {
  return (
    <PageLoading message="Fetching weekly analytics..." />
  );
}

if (error) {
  return (
    <PageError
      icon="analytics"
      title="Analytics metrics could not be loaded"
      description={error}
      onRetry={refetch}
    />
  );
}

return (
  <div className="space-y-xl pb-xl transition-all duration-300">

    <PageHeader
      title="Analytics"
      subtitle="Track weekly workspace performance and productivity."
      icon="analytics"
    />

    <div className="grid grid-cols-12 gap-xl">

      <CompletionTrendChart trendData={metrics?.completionTrend} />

      <AIInsightCard />

      <TaskStatusDistribution />

      <CategoryBreakdown />

    </div>

  </div>
);
}
