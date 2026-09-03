import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getTeams,
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../api/teamService.js";

export default function useTeam() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const teamsData = await getTeams().catch(() => []);

      const membersPromises = teamsData.map(team => getTeamMembers(team.id).catch(() => []));
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
    fetchData();

    // Custom event listener for external triggers (like accepting an invite)
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener("teamRefreshRequired", handleRefresh);
    return () => {
      window.removeEventListener("teamRefreshRequired", handleRefresh);
    };
  }, [fetchData]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const nameStr = member.fullName || member.name || "";
      const roleStr = member.role || "";
      const deptStr = member.department || member.position || "";
      const emailStr = member.email || "";

      const matchesSearch =
        nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deptStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emailStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "All" ||
        roleStr.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeNow = members.filter(
      (m) => m.status?.toLowerCase() === "active",
    ).length;
    const openInvitations = members.filter(
      (m) =>
        m.status?.toLowerCase() === "invited" ||
        m.status?.toLowerCase() === "pending",
    ).length;

    return { totalMembers, activeNow, openInvitations };
  }, [members]);

  const inviteMember = useCallback(async (teamId, userId) => {
    await inviteTeamMember(teamId, userId);
    return true;
  }, []);

  const updateMember = useCallback(async (id, updatedFields) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) throw new Error("Member not found");
    const teamId = targetMember.teamId;

    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m)));

    try {
      await updateTeamMember(teamId, id, updatedFields);
      return true;
    } catch (err) {
      fetchData();
      throw err;
    }
  }, [members, fetchData]);

  const deleteMember = useCallback(async (id) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) throw new Error("Member not found");
    const teamId = targetMember.teamId;

    setMembers((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteTeamMember(teamId, id);
      return true;
    } catch (err) {
      fetchData();
      throw err;
    }
  }, [members, fetchData]);

  return {
    teams,
    members: filteredMembers,
    allMembersCount: members.length,
    stats,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    inviteMember,
    updateMember,
    deleteMember,
    refetch: fetchData,
  };
}
