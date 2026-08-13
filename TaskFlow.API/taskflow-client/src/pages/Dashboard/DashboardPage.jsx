import { useNavigate } from "react-router-dom";
import useDashboard from "@/features/dashboard/hooks/useDashboard";
import { ROUTES } from "@/constants/routesConstants";
import DashboardSkeleton from "@/features/dashboard/components/DashboardSkeleton";

import GreetingSection from "@/features/dashboard/components/GreetingSection";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import TodayPriorities from "@/features/dashboard/components/TodayPriorities";
import { PageContainer } from "@/layout";
import { PageError } from "@/components/common";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    metrics,
    recentTasks,
    highPriorityTasks,
    loading: dashboardLoading,
    error,
    refetch,
    toggleDashboardTask,
  } = useDashboard();
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
      <GreetingSection highPriorityTasks={highPriorityTasks} />
      <StatsOverview metrics={metrics} />

      <section className="w-full">
        <TodayPriorities
          tasks={recentTasks}
          loading={dashboardLoading}
          onToggle={toggleDashboardTask}
          onViewAll={() => navigate(ROUTES.TASKS)}
        />
      </section>
    </PageContainer>
  );
}
