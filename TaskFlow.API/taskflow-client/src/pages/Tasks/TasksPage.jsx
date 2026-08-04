import useTeam from "@/features/teams/hooks/useTeam";
import useAuth from "@/features/auth/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import KanbanColumn from "@/features/tasks/components/KanbanColumn";
import TaskDetailsModal from "@/features/tasks/components/TaskDetailsModal";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import SelectTeamModal from "@/features/tasks/teams/components/SelectTeamModal";
import { PageLoading } from "@/components/common";
import TasksHeader from "@/features/tasks/components/TasksHeader";
import { getTaskPermissions } from "@/features/tasks/utils/taskPermissions";
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
  const isTeamBoard = Boolean(teamId);
    const {
        currentTeam,
        columns,
        totalCount,
        completedCount,
    } = useTaskBoardData({
        tasks,
        teams,
        teamId,
        isTeamBoard,
    });
    const { canCreateTasks, canEditTask } = getTaskPermissions(
        currentTeam,
        user,
        isTeamBoard
    );

    const {
        selectedTaskDetails,
        setSelectedTaskDetails,
        isFormModalOpen,
        isSelectTeamModalOpen,
        selectedTeamForTask,
        handleOpenNewTaskModal,
        handleFormSubmit,
        handleDragDropTask,
        handleToggleStatus,
        handleDeleteTask,
        handleSelectTeam,      // EKLE
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
    <div className="space-y-xl pb-xl transition-all duration-300">
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

      {/* 2. 4-Column Kanban Board */}
      {tasksLoading ? (
        <PageLoading
            message="Loading Kanban Board..."
        />
    ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-start min-h-[600px]">
                      {columns.map((column) => (
                          <KanbanColumn
                              key={column.statusId}
                              title={column.title}
                              statusId={column.statusId}
                              count={column.tasks.length}
                              tasks={column.tasks}
                              color={column.color}
                              onTaskClick={setSelectedTaskDetails}
                              onToggleStatus={handleToggleStatus}
                              onAddTask={canCreateTasks ? handleOpenNewTaskModal : null}
                              onDropTask={handleDragDropTask}
                              canEditTask={canEditTask}
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