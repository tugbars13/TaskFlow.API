import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NotificationPanel from "../features/notifications/components/NotificationPanel";
import useNotifications from "../features/notifications/hooks/useNotifications";
import useAuth from "@/features/auth/hooks/useAuth";

export default function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("taskflow-sidebar-collapsed") === "true";
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const { user, logout } = useAuth();
  
  const location = useLocation();
  const isFullWidthPage = location.pathname.includes('/tasks');

  // teamsRefetch is not directly available in MainLayout, we pass null.
  // User will need to refresh the team page to see the new team, or it will be handled by the Team component's own mount.
  const {
    notifications,
    loading,
    error,
    unreadCount,
    handleMarkAsRead,
    handleAcceptTeamInvite,
    handleRejectTeamInvite,
  } = useNotifications(null);

  useEffect(() => {
    const handleOpenNotifications = () => setIsNotificationOpen(true);
    window.addEventListener("openNotifications", handleOpenNotifications);
    return () => window.removeEventListener("openNotifications", handleOpenNotifications);
  }, []);

  return (
    <div className="min-h-screen bg-background-canvas text-on-surface">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => {
          const nextState = !isSidebarCollapsed;
          setIsSidebarCollapsed(nextState);
          localStorage.setItem("taskflow-sidebar-collapsed", String(nextState));
        }} 
      />

      <Navbar 
        user={user}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadCount}
        onLogout={logout}
      />

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkAsRead={handleMarkAsRead}
        onAcceptInvite={handleAcceptTeamInvite}
        onRejectInvite={handleRejectTeamInvite}
      />

      <main 
        className={cn(
          "min-h-[calc(100vh-72px)] pt-md pb-lg px-md md:px-lg transition-all duration-300 overflow-x-hidden",
          isSidebarCollapsed ? "ml-[80px]" : "ml-[300px]"
        )}
      >
        <div className={`${isFullWidthPage ? 'w-full' : 'max-w-[var(--spacing-container-max)] mx-auto'} space-y-xl`}>
          {children ?? <Outlet />}
        </div>
      </main>

    </div>
  );
}
