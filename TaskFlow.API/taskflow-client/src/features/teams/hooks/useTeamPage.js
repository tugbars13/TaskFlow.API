import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import useAuth from "@/features/auth/hooks/useAuth";
import useTasks from "@/features/tasks/hooks/useTasks";
import useTeam from "./useTeam";
import {
  createTeam,
  deleteTeam,
} from "../api/teamservice.Js";

const ROLE_ORDER = { owner: 0, admin: 1, member: 2 };
const TOAST_TIMEOUT_MS = 4000;

/**
 * Page-level orchestration for the Teams screen: builds the display model
 * from the raw team/member data and owns the modal + toast state.
 * Data fetching itself stays in useTeam.
 */
export default function useTeamPage() {
  const { user } = useAuth();
  const {
    teams = [],
    members = [],
    loading,
    error,
    refetch,
    inviteMember,
    updateMember,
    deleteMember,
  } = useTeam();
  const { addTask } = useTasks();

  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal target state
  const [activeAddMemberTeam, setActiveAddMemberTeam] = useState(null);
  const [activeAssignTaskMember, setActiveAssignTaskMember] = useState(null);
  const [activeChangeRoleMember, setActiveChangeRoleMember] = useState(null);
  const [activeRemoveMember, setActiveRemoveMember] = useState(null);
  const [activeDeleteTeam, setActiveDeleteTeam] = useState(null);

  const toastTimerRef = useRef(null);

  const showToast = useCallback((type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ type, text });
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Database-driven team list from GET /api/teams & GET /api/Team
  const teamsList = useMemo(() => {
    if (!teams || teams.length === 0) return [];

    const membersByTeam = members.reduce((acc, m) => {
      const tId = Number(m.teamId);
      acc[tId] = acc[tId] || [];
      acc[tId].push(m);
      return acc;
    }, {});

    return teams.map((team) => {
      // Group members strictly by TeamId from GET /api/Team response
      const teamMembers = membersByTeam[Number(team.id)] || [];

      // Sort: Owner first → Admins → Members
      const sortedMembers = [...teamMembers].sort((a, b) => {
        const aOrder = ROLE_ORDER[(a.role || "member").toLowerCase()] ?? 3;
        const bOrder = ROLE_ORDER[(b.role || "member").toLowerCase()] ?? 3;
        return aOrder - bOrder;
      });

      const formattedMembers = sortedMembers.map((m) => ({
        id: m.id,
        name: m.fullName || m.name || "User",
        role: m.role || "Member",
        isOwner: String(m.role).toLowerCase() === "owner",
        avatarUrl: m.avatarUrl,
      }));

      return {
        id: team.id, // Real SQL Server Team.Id primary key
        name: team.name,
        description: team.description,
        memberCount: formattedMembers.length,
        // userRole comes directly from the API — set by TeamsController using JWT userId
        userRole: team.userRole || "",
        icon: "groups",
        members: formattedMembers,
      };
    });
  }, [teams, members]);

  const stats = useMemo(
    () => ({
      totalMembers: teamsList.length,
      activeNow: teamsList.reduce(
        (acc, t) => acc + (t.memberCount || t.members.length),
        0,
      ),
      openInvitations: teamsList.filter((t) => t.userRole === "Owner").length,
    }),
    [teamsList],
  );

  // Accordion Toggle: Only ONE team can stay open at a time
  const handleToggleExpand = useCallback((teamId) => {
    setExpandedTeamId((prevId) => (prevId === teamId ? null : teamId));
  }, []);

  // Create Team via POST /api/teams in Database
  const handleCreateTeam = useCallback(
    async (newTeamData) => {
      try {
        await createTeam({
          name: newTeamData.name,
          description: newTeamData.description,
        });

        await refetch();
        showToast(
          "success",
          `Team "${newTeamData.name}" created successfully!`,
        );
      } catch (err) {
        console.error("Failed to create team in database:", err);
        showToast("error", err.message || "Failed to create team.");
      }
    },
    [refetch, showToast],
  );

  // Add Member via POST /api/Team using real SQL Server Team.Id
  const handleAddMemberToTeam = useCallback(
    async (memberData) => {
      if (!activeAddMemberTeam) return;

      const payload = {
        userId: Number(memberData.userId) || 1,
        teamId: Number(activeAddMemberTeam.id), // Real SQL Server Team.Id
        fullName: memberData.name || memberData.fullName || "Team Member",
        role: memberData.role || "Member",
      };

      try {
        await inviteMember(payload);
        showToast(
          "success",
          `${payload.fullName} added to ${activeAddMemberTeam.name}!`,
        );
      } catch (err) {
        console.warn("POST /api/Team error:", err);
        if (err?.response?.status === 403) {
          showToast(
            "error",
            "You don't have permission to add members to this team.",
          );
        } else {
          showToast(
            "error",
            "Failed to add member to team.",
          );
        }
      }
    },
    [activeAddMemberTeam, inviteMember, showToast],
  );

  // Change Role via PUT /api/Team/{id}
  const handleChangeRole = useCallback(
    async (memberId, newRole) => {
      try {
        await updateMember(memberId, { role: newRole });
        showToast("success", "Member role updated successfully!");
      } catch (err) {
        console.error("PUT /api/Team error:", err);
        if (err?.response?.status === 403) {
          showToast("error", "Only the team Owner can change member roles.");
        } else {
          showToast("error", "Failed to update member role.");
        }
      }
    },
    [updateMember, showToast],
  );

  // Remove Member via DELETE /api/Team/{id}
  const handleRemoveMember = useCallback(
    async (memberId) => {
      try {
        const removedMember = activeRemoveMember;
        await deleteMember(memberId);

        if (removedMember && user && removedMember.userId === user.id) {
          // If the current user was removed from the team
          if (expandedTeamId === removedMember.teamId) {
            setExpandedTeamId(null);
          }
          showToast("success", "You have left the team.");
        } else {
          showToast("success", "Member removed from team.");
        }

        setActiveRemoveMember(null);
      } catch (err) {
        console.error("DELETE /api/Team error:", err);
        if (err?.response?.status === 403) {
          showToast("error", "Only the team Owner can remove members.");
        } else {
          showToast("error", "Failed to remove member.");
        }
      }
    },
    [activeRemoveMember, expandedTeamId, deleteMember, showToast, user],
  );

  const handleCreateTaskFromModal = useCallback(
    async (taskPayload) => {
      await addTask(taskPayload);
      setActiveAssignTaskMember(null);
      showToast("success", "Task created and assigned!");
    },
    [addTask, showToast],
  );

  // Delete Team via DELETE /api/teams/{id}
  const handleDeleteTeam = useCallback(async () => {
    if (!activeDeleteTeam) return;
    try {
      await deleteTeam(activeDeleteTeam.id);
      await refetch();
      showToast("success", "Team deleted successfully.");
      setActiveDeleteTeam(null);
    } catch (err) {
      console.error("DELETE /api/teams error:", err);
      if (err?.response?.status === 409) {
        showToast(
          "error",
          "This team still contains tasks. Please move or delete all remaining tasks before deleting the team.",
        );
      } else {
        showToast("error", "Failed to delete team.");
      }
    }
  }, [activeDeleteTeam, refetch, showToast]);

  return {
    // data
    teamsList,
    stats,
    loading,
    error,
    refetch,
    toastMessage,

    // accordion
    expandedTeamId,
    handleToggleExpand,

    // modal state
    isCreateModalOpen,
    setIsCreateModalOpen,
    activeAddMemberTeam,
    setActiveAddMemberTeam,
    activeAssignTaskMember,
    setActiveAssignTaskMember,
    activeChangeRoleMember,
    setActiveChangeRoleMember,
    activeRemoveMember,
    setActiveRemoveMember,
    activeDeleteTeam,
    setActiveDeleteTeam,

    // actions
    handleCreateTeam,
    handleAddMemberToTeam,
    handleChangeRole,
    handleRemoveMember,
    handleCreateTaskFromModal,
    handleDeleteTeam,
  };
}
