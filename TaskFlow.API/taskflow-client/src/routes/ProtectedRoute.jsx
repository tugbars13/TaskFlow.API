import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../features/auth/hooks/useAuth";
import { ROUTES } from "../constants/routes.constants";
import Spinner from "@/components/ui/Spinner";

/**
 * ProtectedRoute Component
 * 
 * Guards private application routes.
 * Checks authentication status via useAuth() and handles automatic redirects.
 * Supports optional Role-Based Access Control (RBAC) via requiredRole prop.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, authLoading, hasRole } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? children : <Outlet />;
}
