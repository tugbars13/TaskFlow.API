import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { ROUTES } from "../constants/routes.constants";
import ProtectedRoute from "./ProtectedRoute";
import { Spinner } from "@/components/ui";

// Lazy Loaded Pages
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const TasksPage = lazy(() => import("../pages/Tasks/TasksPage"));
const CalendarPage = lazy(() => import("../pages/Calendar/CalendarPage"));
const Analytics = lazy(() => import("../pages/Analytics/Analytics"));
const TeamPage = lazy(() => import("../pages/Team/TeamPage"));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage"));
const MainLayout = lazy(() => import("../components/layout/MainLayout"));

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

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.TASKS} element={<TasksPage />} />
            <Route path={ROUTES.TEAM_TASKS} element={<TasksPage />} />
            <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
            <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
            <Route path={ROUTES.TEAM} element={<TeamPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Suspense>
  );
}