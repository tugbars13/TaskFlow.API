import useTeamPage from "@/features/teams/hooks/useTeamPage";
import TeamToolbar from "@/features/teams/components/TeamToolbar";
import TeamStats from "@/features/teams/components/TeamStats";
import TeamCard from "@/features/teams/components/TeamCard";
import CreateTeamModal from "@/features/teams/components/CreateTeamModal";
import AddTeamMemberModal from "@/features/teams/components/AddTeamMemberModal";
import ChangeRoleModal from "@/features/teams/components/ChangeRoleModal";
import RemoveMemberModal from "@/features/teams/components/RemoveMemberModal";
import DeleteTeamModal from "@/features/teams/components/DeleteTeamModal";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import { PageLoading, PageError } from "@/components/common";

export default function TeamPage() {
  const {
    teamsList,
    stats,
    loading,
    error,
    refetch,
    toastMessage,
    expandedTeamId,
    handleToggleExpand,
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
    handleCreateTeam,
    handleAddMemberToTeam,
    handleChangeRole,
    handleRemoveMember,
    handleCreateTaskFromModal,
    handleDeleteTeam,
  } = useTeamPage();

  if (loading) {
    return <PageLoading message="Loading Teams..." />;
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
    <div className="space-y-xl pb-xl transition-all duration-300 relative">
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

      {/* 2. Teams Statistics Overview */}
      <TeamStats stats={stats} />

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
              You haven&apos;t created any teams yet. Click &quot;Create New
              Team&quot; in the top-right corner to create your first team.
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
        teamId={activeAddMemberTeam?.id}
        onAddMember={handleAddMemberToTeam}
      />

      {/* Standard Integrated Task Creation Modal */}
      <TaskFormModal
        isOpen={Boolean(activeAssignTaskMember)}
        onClose={() => setActiveAssignTaskMember(null)}
        onSubmit={handleCreateTaskFromModal}
        initialData={
          activeAssignTaskMember
            ? { assignedUserId: activeAssignTaskMember.userId }
            : null
        }
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
