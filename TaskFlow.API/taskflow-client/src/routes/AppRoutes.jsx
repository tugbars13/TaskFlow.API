import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { ROUTES } from "../constants/routesConstants";
import ProtectedRoute from "./ProtectedRoute";
import { Spinner } from "@/components/ui";

// Lazy Loaded Pages
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/Auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const OverviewPage = lazy(() => import("../pages/Dashboard/OverviewPage"));
const TasksPage = lazy(() => import("../pages/Tasks/TasksPage"));
const CalendarPage = lazy(() => import("../pages/Calendar/CalendarPage"));
const Analytics = lazy(() => import("../pages/Analytics/AnalyticsPage"));
const TeamPage = lazy(() => import("../pages/Team/TeamPage"));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage"));
const MySpacePage = lazy(() => import("../features/myspace/pages/MySpacePage"));
const SharedPageView = lazy(() => import("../features/myspace/pages/SharedPageView"));
const MainLayout = lazy(() => import("../layout/MainLayout"));

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<LoginPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.SHARED_PAGE} element={<SharedPageView />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.OVERVIEW} element={<OverviewPage />} />
            <Route path={ROUTES.TASKS} element={<TasksPage />} />
            <Route path={ROUTES.TEAM_TASKS} element={<TasksPage />} />
            <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
            <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
            <Route path={ROUTES.TEAM} element={<TeamPage />} />
            <Route path={ROUTES.MY_SPACE + "/*"} element={<MySpacePage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Suspense>
  );
}
