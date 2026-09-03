import { createContext, useState, useEffect, useCallback } from "react";
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
      const teamsData = await getTeams().catch(() => []);

      const membersPromises = teamsData.map((team) =>
        getTeamMembers(team.id).catch(() => []),
      );

      const membersArrays = await Promise.all(membersPromises);
      const membersData = membersArrays.flat();

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      console.error("Failed to load teams workspace from database API:", err);
      setError(err.message || "Failed to load teams workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchData();

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
    return true;
  }, []);

  const updateMember = useCallback(
    async (id, updatedFields) => {
      const targetMember = members.find((m) => m.id === id);

      if (!targetMember) {
        throw new Error("Member not found");
      }

      const teamId = targetMember.teamId;

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m)),
      );

      try {
        await updateTeamMember(teamId, id, updatedFields);
        return true;
      } catch (err) {
        fetchData();
        throw err;
      }
    },
    [members, fetchData],
  );

  const deleteMember = useCallback(
    async (id) => {
      const targetMember = members.find((m) => m.id === id);

      if (!targetMember) {
        throw new Error("Member not found");
      }

      const teamId = targetMember.teamId;

      setMembers((prev) => prev.filter((m) => m.id !== id));

      try {
        await deleteTeamMember(teamId, id);
        return true;
      } catch (err) {
        fetchData();
        throw err;
      }
    },
    [members, fetchData],
  );

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
