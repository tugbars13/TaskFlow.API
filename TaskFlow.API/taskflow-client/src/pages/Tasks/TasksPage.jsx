import React, { useMemo } from "react";
import useTeam from "@/features/teams/hooks/useTeam";
import useAuth from "@/features/auth/hooks/useAuth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import KanbanColumn from "@/features/tasks/components/KanbanColumn";
import TaskDetailsModal from "@/features/tasks/components/TaskDetailsModal";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import SelectTeamModal from "@/features/teams/components/SelectTeamModal";
import { PageLoading } from "@/components/common";
import TasksHeader from "@/features/tasks/components/TasksHeader";
import TaskFilters from "@/features/tasks/components/TaskFilters";
import useTaskBoard from "@/features/tasks/hooks/useTaskBoard";
import useTaskBoardData from "@/features/tasks/hooks/useTaskBoardData";
import useTasks from "@/features/tasks/hooks/useTasks";
export default function TasksPage() {
  const {
    tasks,
    loading: tasksLoading,
    addTask,
    removeTask,
    toggleTaskStatus,
    moveTaskColumn,
  } = useTasks();

  const { teams, members: teamMembers } = useTeam();
  const { teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    keyword: searchParams.get("keyword") || "",
    priority: searchParams.get("priority") || "",
    category: searchParams.get("category") || "",
    assigneeId: searchParams.get("assigneeId") || "",
    dueDateRange: searchParams.get("dueDateRange") || "",
    status: searchParams.get("status") || ""
  };

  const handleFilterChange = (key, value) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      return newParams;
    });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const isTeamBoard = Boolean(teamId);
  const { currentTeam, columns, totalCount, completedCount } = useTaskBoardData(
    {
      tasks,
      teams,
      teamId,
      isTeamBoard,
    },
  );

  const assigneeOptions = React.useMemo(() => {
    const options = [
      { value: "", label: "All" },
      { value: "Me", label: user ? `Me (${user.fullName || user.displayName || user.name})` : "Me" },
      { value: "Unassigned", label: "Unassigned" },
    ];

    if (!teamMembers || !Array.isArray(teamMembers)) return options;

    let relevantMembers = teamMembers;

    if (isTeamBoard) {
      relevantMembers = teamMembers.filter(m => m.teamId === parseInt(teamId, 10));
    }

    const uniqueUsers = new Map();
    relevantMembers.forEach(m => {
      if (user && m.userId === user.id) return;
      if (!uniqueUsers.has(m.userId)) {
        uniqueUsers.set(m.userId, m);
      }
    });

    const dynamicOptions = Array.from(uniqueUsers.values()).map(m => ({
      value: m.userId.toString(),
      label: m.fullName || m.email || `User ${m.userId}`
    }));

    dynamicOptions.sort((a, b) => a.label.localeCompare(b.label));

    return [...options, ...dynamicOptions];
  }, [teamMembers, isTeamBoard, teamId, user]);
  const canCreateTasks = true;
  const canEditTask = () => true;

  const {
    selectedTaskDetails,
    handleSelectTaskDetails,
    isFormModalOpen,
    isSelectTeamModalOpen,
    selectedTeamForTask,
    handleOpenNewTaskModal,
    handleFormSubmit,
    handleDragDropTask,
    handleToggleStatus,
    handleDeleteTask,
    handleSelectTeam, // EKLE
    handleCloseForm,
    handleCloseSelectTeam,
    handleCloseTaskDetails,
  } = useTaskBoard({
    tasks,
    teams,
    teamId,
    isTeamBoard,
    canEditTask,
    addTask,
    removeTask,
    moveTaskColumn,
    toggleTaskStatus,
  });
  const canEditSelectedTask =
    selectedTaskDetails && canEditTask(selectedTaskDetails);

  return (
    <div className="space-y-4 pb-4 transition-all duration-300 w-full overflow-hidden">
      {/* 1. Project Header & Controls */}
      <TasksHeader
        isTeamBoard={isTeamBoard}
        currentTeam={currentTeam}
        teams={teams}
        teamId={teamId}
        navigate={navigate}
        teamMembers={teamMembers}
        totalCount={totalCount}
        completedCount={completedCount}
        canCreateTasks={canCreateTasks}
        handleOpenNewTaskModal={handleOpenNewTaskModal}
      />

      <TaskFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onClearFilters={handleClearFilters} 
        assigneeOptions={assigneeOptions}
        isTeamBoard={isTeamBoard}
      />

      {/* 2. 4-Column Kanban Board */}
      {tasksLoading ? (
        <PageLoading message="Loading Kanban Board..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.statusId}
              title={column.title}
              statusId={column.statusId}
              count={column.tasks.length}
              tasks={column.tasks}
              color={column.color}
              onTaskClick={handleSelectTaskDetails}
              onToggleStatus={handleToggleStatus}
              onDropTask={handleDragDropTask}
              canEditTask={canEditTask}
              isTeamBoard={isTeamBoard}
            />
          ))}
        </div>
      )}

      {/* Centered Task Details Modal */}
      <TaskDetailsModal
        isOpen={Boolean(selectedTaskDetails)}
        onClose={handleCloseTaskDetails}
        task={selectedTaskDetails}
        onToggleStatus={canEditSelectedTask ? handleToggleStatus : null}
        onDeleteTask={canEditSelectedTask ? handleDeleteTask : null}
        isReadOnly={!canEditSelectedTask}
      />

      {/* Team Selection Modal */}
      <SelectTeamModal
        isOpen={isSelectTeamModalOpen}
        onClose={handleCloseSelectTeam}
        teams={teams}
        onSelectTeam={handleSelectTeam}
      />

      {/* Global Task Creation Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        teamId={selectedTeamForTask}
      />
    </div>
  );
}
