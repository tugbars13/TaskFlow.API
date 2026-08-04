import { useNavigate } from "react-router-dom";
import useDashboard from "@/features/dashboard/hooks/useDashboard";
import { ROUTES } from "@/constants/routes.constants";

import GreetingSection from "@/features/dashboard/components/GreetingSection";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import TodayPriorities from "@/features/dashboard/components/TodayPriorities";
import ProductivityPulse from "@/features/dashboard/components/ProductivityPulse";
import Button from "@/components/ui/Button";
import { PageContainer } from "@/components/layout";
import { PageError } from "@/components/common";
function DashboardSkeleton() {
  return (
    <div className="space-y-xl animate-pulse">
      <div className="h-28 bg-surface-container-high/40 rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-surface-container-high/40 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-8 h-80 bg-surface-container-high/40 rounded-3xl" />
        <div className="lg:col-span-4 h-80 bg-surface-container-high/40 rounded-3xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboardMetrics, loading: dashboardLoading, error, refetch, toggleDashboardTask } = useDashboard();

  if (dashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
  return (
    <PageError
      icon="dashboard"
      title="Dashboard could not be loaded"
      description={error}
      onRetry={refetch}
    />
  );
}

  return (
  <PageContainer>
    <GreetingSection
      user="Alex"
      highPriorityTasks={dashboardMetrics?.highPriorityTasks}
    />

    <StatsOverview metrics={dashboardMetrics} />

    <section className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
      <div className="lg:col-span-8">
        <TodayPriorities
          tasks={dashboardMetrics?.todayPriorities || []}
          loading={dashboardLoading}
          onToggle={toggleDashboardTask}
          onViewAll={() => navigate(ROUTES.TASKS)}
        />
      </div>

      <div className="lg:col-span-4">
        <ProductivityPulse
          pulse={dashboardMetrics?.productivityPulse}
        />
      </div>
    </section>
  </PageContainer>
);
}
