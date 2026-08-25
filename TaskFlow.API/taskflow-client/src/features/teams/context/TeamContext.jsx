import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getTeams,
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../api/teamService.js";
import useAuth from "@/features/auth/hooks/useAuth";

export const TeamContext = createContext();

export default function TeamProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchData = useCallback(async (background = false) => {
    if (!background) {
      setLoading(true);
    }
    setError(null);
    try {
      const [teamsData, membersData] = await Promise.all([
        getTeams().catch(() => []),
        getTeamMembers().catch(() => []),
      ]);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      console.error("Failed to load teams workspace from database API:", err);
      setError(err.message || "Failed to load teams workspace.");
    } finally {
      if (!background) {
        setLoading(false);
      } else {
        // Also ensure loading is false if background succeeds when already loading, just in case
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchData();

    // Custom event listener for external triggers (like accepting an invite)
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener("teamRefreshRequired", handleRefresh);
    return () => {
      window.removeEventListener("teamRefreshRequired", handleRefresh);
    };
  }, [fetchData, authLoading, isAuthenticated]);

  const inviteMember = useCallback(async (teamId, userId) => {
    await inviteTeamMember(teamId, userId);
    // Note: Since this is an invite, the user is pending and shouldn't appear instantly as an active member.
    return true;
  }, []);

  const updateMember = useCallback(async (id, updatedFields) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m)));

    try {
      await updateTeamMember(id, updatedFields);
      return true;
    } catch (err) {
      fetchData();
      throw err;
    }
  }, [fetchData]);

  const deleteMember = useCallback(async (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteTeamMember(id);
      return true;
    } catch (err) {
      fetchData();
      throw err;
    }
  }, [fetchData]);

  const contextValue = {
    teams,
    members,
    loading,
    error,
    refetch: fetchData,
    inviteMember,
    updateMember,
    deleteMember,
  };

  return (
    <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
  );
}
