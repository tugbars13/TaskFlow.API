import { useState, useEffect, useCallback, useMemo } from "react";
import { getNotifications, markAsRead } from "../api/notificationService";
import { acceptTeamInvitation, rejectTeamInvitation } from "../../teams/api/teamService";

export default function useNotifications(teamsRefetch) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = useCallback(async (id) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markAsRead(id);
    } catch (err) {
      // Revert if failed
      loadNotifications();
      console.error("Failed to mark notification as read", err);
    }
  }, [loadNotifications]);

  const handleAcceptTeamInvite = useCallback(async (notificationId, teamId) => {
    try {
      await acceptTeamInvitation(teamId);
      // Mark as read explicitly after a successful accept
      await handleMarkAsRead(notificationId);
      
      // Notify team page to refresh if it's mounted
      if (teamsRefetch) {
        teamsRefetch();
      } else {
        window.dispatchEvent(new CustomEvent("teamRefreshRequired"));
      }
      return true;
    } catch (err) {
      console.error("Failed to accept team invite", err);
      throw err;
    }
  }, [handleMarkAsRead, teamsRefetch]);

  const handleRejectTeamInvite = useCallback(async (notificationId, teamId) => {
    try {
      await rejectTeamInvitation(teamId);
      await handleMarkAsRead(notificationId);
      return true;
    } catch (err) {
      console.error("Failed to reject team invite", err);
      throw err;
    }
  }, [handleMarkAsRead]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    handleMarkAsRead,
    handleAcceptTeamInvite,
    handleRejectTeamInvite,
  };
}
