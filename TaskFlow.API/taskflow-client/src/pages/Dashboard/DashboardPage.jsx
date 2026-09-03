import { useNavigate } from "react-router-dom";
import useDashboard from "@/features/dashboard/hooks/useDashboard";
import { ROUTES } from "@/constants/routesConstants";
import { PageContainer } from "@/layout";
import { PageError } from "@/components/common";
import useMySpaceRecent from "@/features/myspace/hooks/useMySpaceRecent";

// Import our new extracted components
import DashboardSkeleton from "@/features/dashboard/components/DashboardSkeleton";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
import PriorityTasksList from "@/features/dashboard/components/PriorityTasksList";
import DashboardMySpaceWidget from "@/features/dashboard/components/DashboardMySpaceWidget";
import QuickActionsList from "@/features/dashboard/components/QuickActionsList";

function getTurkishDate() {
  return new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { metrics, recentTasks, loading, error, refetch } = useDashboard();
  const mySpace = useMySpaceRecent();

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <PageError
        icon="dashboard"
        title="Dashboard yüklenemedi"
        description={error}
        onRetry={refetch}
      />
    );

  return (
    <PageContainer>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface leading-none tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-1.5 font-medium">
            Bugünün görevleri ve çalışma alanınız&nbsp;·&nbsp;
            {getTurkishDate()}
          </p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <DashboardStats metrics={metrics} mySpace={mySpace} />

      {/* ── Main 2-column ── */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        <PriorityTasksList recentTasks={recentTasks} navigate={navigate} />
        <DashboardMySpaceWidget mySpace={mySpace} navigate={navigate} />
      </div>

      {/* ── Hızlı Erişim ── */}
      <QuickActionsList metrics={metrics} navigate={navigate} />
    </PageContainer>
  );
}
