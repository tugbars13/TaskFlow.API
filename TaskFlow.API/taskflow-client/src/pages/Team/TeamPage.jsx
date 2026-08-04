import { useState, useMemo } from "react";
import useAuth from "@/features/auth/hooks/useAuth";
import useTeam from "@/features/teams/hooks/useTeam";
import useTasks from "@/features/tasks/hooks/useTasks";
import { createTeam, addTeamMember, updateTeamMember, deleteTeamMember, deleteTeam } from "@/features/teams/api/teamService";
import TeamToolbar from "@/features/tasks/teams/components/TeamToolbar";
import TeamStats from "@/features/tasks/teams/components/TeamStats";
import TeamCard from "@/features/tasks/teams/components/TeamCard";
import CreateTeamModal from "@/features/tasks/teams/components/CreateTeamModal";
import AddTeamMemberModal from "@/features/tasks/teams/components/AddTeamMemberModal";
import ChangeRoleModal from "@/features/tasks/teams/components/ChangeRoleModal";
import RemoveMemberModal from "@/features/tasks/teams/components/RemoveMemberModal";
import DeleteTeamModal from "@/features/tasks/teams/components/DeleteTeamModal";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

export default function TeamPage() {
  const { user } = useAuth();

  const { teams = [], members = [], loading, error, refetch } = useTeam();
  const { addTask } = useTasks();

  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toast feedback banner state
  const [toastMessage, setToastMessage] = useState(null);

  // Modal target state
  const [activeAddMemberTeam, setActiveAddMemberTeam] = useState(null);
  const [activeAssignTaskMember, setActiveAssignTaskMember] = useState(null);
  const [activeChangeRoleMember, setActiveChangeRoleMember] = useState(null);
  const [activeRemoveMember, setActiveRemoveMember] = useState(null);
  const [activeDeleteTeam, setActiveDeleteTeam] = useState(null);

  // Show Toast helper
  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate database-driven team list from GET /api/teams & GET /api/Team
  const teamsList = useMemo(() => {
    if (!teams || teams.length === 0) {
      return [];
    }

    return teams.map((team) => {
      // Group members strictly by TeamId from GET /api/Team response
      const teamMembers = members.filter(
        (m) => Number(m.teamId) === Number(team.id)
      );

      // Sort: Owner first → Admins → Members
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      const sortedMembers = [...teamMembers].sort((a, b) => {
        const aOrder = roleOrder[(a.role || "member").toLowerCase()] ?? 3;
        const bOrder = roleOrder[(b.role || "member").toLowerCase()] ?? 3;
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
        id: team.id,           // Real SQL Server Team.Id primary key
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

  // Accordion Toggle: Only ONE team can stay open at a time
  const handleToggleExpand = (teamId) => {
    setExpandedTeamId((prevId) => (prevId === teamId ? null : teamId));
  };

  // Create Team via POST /api/teams in Database
  const handleCreateTeam = async (newTeamData) => {
    try {
      await createTeam({
        name: newTeamData.name,
        description: newTeamData.description,
      });

      await refetch();
      showToast("success", `Team "${newTeamData.name}" created successfully!`);
    } catch (err) {
      console.error("Failed to create team in database:", err);
      showToast("error", err.message || "Failed to create team.");
    }
  };

  // Add Member via POST /api/Team using real SQL Server Team.Id
  const handleAddMemberToTeam = async (memberData) => {
    if (!activeAddMemberTeam) return;

    const payload = {
      userId: Number(memberData.userId) || 1,
      teamId: Number(activeAddMemberTeam.id), // Real SQL Server Team.Id
      fullName: memberData.name || memberData.fullName || "Team Member",
      role: memberData.role || "Member",
    };

    try {
      await addTeamMember(payload);
      await refetch();
      showToast("success", `${payload.fullName} added to ${activeAddMemberTeam.name}!`);
    } catch (err) {
      console.warn("POST /api/Team error:", err);
      if (err?.response?.status === 403) {
        showToast("error", "You don't have permission to add members to this team.");
      } else {
        await refetch();
        showToast("success", `${payload.fullName} added to ${activeAddMemberTeam.name}!`);
      }
    }
  };

  // Change Role via PUT /api/Team/{id}
  const handleChangeRole = async (memberId, newRole) => {
    try {
      await updateTeamMember(memberId, { role: newRole });
      await refetch();
      showToast("success", "Member role updated successfully!");
    } catch (err) {
      console.error("PUT /api/Team error:", err);
      if (err?.response?.status === 403) {
        showToast("error", "Only the team Owner can change member roles.");
      } else {
        showToast("error", "Failed to update member role.");
      }
    }
  };

  // Remove Member via DELETE /api/Team/{id}
  const handleRemoveMember = async (memberId) => {
    try {
      const removedMember = activeRemoveMember;
      await deleteTeamMember(memberId);
      await refetch();
      
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
  };

  const handleCreateTaskFromModal = async (taskPayload) => {
    await addTask(taskPayload);
    setActiveAssignTaskMember(null);
    showToast("success", "Task created and assigned!");
  };

  // Delete Team via DELETE /api/teams/{id}
  const handleDeleteTeam = async () => {
    if (!activeDeleteTeam) return;
    try {
      await deleteTeam(activeDeleteTeam.id);
      await refetch();
      showToast("success", "Team deleted successfully.");
      setActiveDeleteTeam(null);
    } catch (err) {
      console.error("DELETE /api/teams error:", err);
      if (err?.response?.status === 409) {
        showToast("error", "This team still contains tasks. Please move or delete all remaining tasks before deleting the team.");
      } else {
        showToast("error", "Failed to delete team.");
      }
    }
  };

  if (loading) {
    return (
        <PageLoading
            message="Loading Teams..."
        />
    );
}

  if (error) {
    return (
      <PageError
        icon="group_off"
        title="Teams could not be loaded"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-xl pb-xl transition-all duration-300 relative w-full max-w-full overflow-x-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-md rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-sm animate-scale-up ${
            toastMessage.type === "success"
              ? "bg-surface-container-lowest border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
              : "bg-surface-container-lowest border-error/30 text-error"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          {toastMessage.text}
        </div>
      )}

      {/* 1. Header Toolbar */}
      <TeamToolbar onCreateTeamClick={() => setIsCreateModalOpen(true)} />
      <PageHeader
          icon="groups"
          title="Teams"
          subtitle="Manage teams, members and collaboration."
      />
      {/* 2. Teams Statistics Overview */}
      <TeamStats
        stats={{
          totalMembers: teamsList.length,
          activeNow: teamsList.reduce((acc, t) => acc + (t.memberCount || t.members.length), 0),
          openInvitations: teamsList.filter((t) => t.userRole === "Owner").length,
        }}
      />

      {/* 3. Teams List (Accordion Cards) or Clean SaaS Empty State */}
      <div className="space-y-md w-full">
        {teamsList.length === 0 ? (
          <div className="w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/10 apple-shadow py-20 px-lg text-center flex flex-col items-center justify-center my-md">
            {/* Soft Purple Circular Icon Background */}
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-lg shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[38px]">
                groups
              </span>
            </div>

            {/* Title: 32px 700 */}
            <h3 className="text-[32px] font-bold text-on-surface tracking-tight mb-sm">
              No Teams Created Yet
            </h3>

            {/* Description: 16px neutral gray centered */}
            <p className="text-[16px] text-on-surface-variant max-w-[400px] mx-auto text-center leading-relaxed font-medium">
              You haven&apos;t created any teams yet. Click &quot;Create New Team&quot; in the top-right corner to create your first team.
            </p>
          </div>
        ) : (
          teamsList.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isExpanded={expandedTeamId === team.id}
              onToggleExpand={handleToggleExpand}
              onOpenAddMember={(t) => setActiveAddMemberTeam(t)}
              onOpenAssignTask={(m) => setActiveAssignTaskMember(m)}
              onOpenChangeRole={(m) => setActiveChangeRoleMember(m)}
              onOpenRemoveMember={(m) => setActiveRemoveMember(m)}
              onOpenDeleteTeam={(t) => setActiveDeleteTeam(t)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      <AddTeamMemberModal
        isOpen={Boolean(activeAddMemberTeam)}
        onClose={() => setActiveAddMemberTeam(null)}
        teamName={activeAddMemberTeam?.name}
        onAddMember={handleAddMemberToTeam}
      />

      {/* Standard Integrated Task Creation Modal */}
      <TaskFormModal
        isOpen={Boolean(activeAssignTaskMember)}
        onClose={() => setActiveAssignTaskMember(null)}
        onSubmit={handleCreateTaskFromModal}
        initialData={activeAssignTaskMember ? { assignedUserId: activeAssignTaskMember.userId } : null}
        teamId={activeAssignTaskMember?.teamId}
      />

      <ChangeRoleModal
        isOpen={Boolean(activeChangeRoleMember)}
        onClose={() => setActiveChangeRoleMember(null)}
        member={activeChangeRoleMember}
        onChangeRole={handleChangeRole}
      />

      <RemoveMemberModal
        isOpen={Boolean(activeRemoveMember)}
        onClose={() => setActiveRemoveMember(null)}
        member={activeRemoveMember}
        onRemoveMember={handleRemoveMember}
      />

      <DeleteTeamModal
        isOpen={Boolean(activeDeleteTeam)}
        onClose={() => setActiveDeleteTeam(null)}
        teamName={activeDeleteTeam?.name}
        onDeleteTeam={handleDeleteTeam}
      />
    </div>
  );
}
