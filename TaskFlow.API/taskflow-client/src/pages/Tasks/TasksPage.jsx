import { useMemo, useState, useEffect } from "react";
import useTeam from "@/features/teams/hooks/useTeam";
import useAuth from "@/features/auth/hooks/useAuth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import KanbanColumn from "@/features/tasks/components/KanbanColumn";
import TaskDetailsModal from "@/features/tasks/components/TaskDetailsModal";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import SelectTeamModal from "@/features/teams/components/SelectTeamModal";
import { PageLoading, PageError } from "@/components/common";
import TasksHeader from "@/features/tasks/components/TasksHeader";
import TaskFilters from "@/features/tasks/components/TaskFilters";
import useTaskBoard from "@/features/tasks/hooks/useTaskBoard";
import useTaskBoardData from "@/features/tasks/hooks/useTaskBoardData";
import useTasks from "@/features/tasks/hooks/useTasks";
import useTaskLoader from "@/features/tasks/hooks/useTaskLoader";
import useTaskActions from "@/features/tasks/hooks/useTaskActions";

export default function TasksPage() {
  const globalTasksContext = useTasks();
  const { teamId } = useParams();
  const isTeamBoard = Boolean(teamId);

  const [localTasks, setLocalTasks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  const { loadTasks: loadLocalTasks } = useTaskLoader({
    setTasks: setLocalTasks,
    setLoading: setLocalLoading,
    setError: setLocalError,
  });

  const localActions = useTaskActions({
    tasks: localTasks,
    setTasks: setLocalTasks,
    setError: setLocalError,
    notifyChange: () => {},
    loadTasks: loadLocalTasks,
    currentTeamId: teamId,
  });

  const tasks = isTeamBoard ? localTasks : globalTasksContext.tasks;
  const tasksLoading = isTeamBoard ? localLoading : globalTasksContext.loading;
  const tasksError = isTeamBoard ? localError : globalTasksContext.error;

  const loadTasks = isTeamBoard ? loadLocalTasks : globalTasksContext.loadTasks;
  const addTask = isTeamBoard ? localActions.addTask : globalTasksContext.addTask;
  const removeTask = isTeamBoard ? localActions.removeTask : globalTasksContext.removeTask;
  const toggleTaskStatus = isTeamBoard ? localActions.toggleTaskStatus : globalTasksContext.toggleTaskStatus;
  const moveTaskColumn = isTeamBoard ? localActions.moveTaskColumn : globalTasksContext.moveTaskColumn;

  useEffect(() => {
    if (isTeamBoard) {
      loadLocalTasks(teamId);
    } else {
      globalTasksContext.loadTasks(null);
    }
  }, [teamId, isTeamBoard, loadLocalTasks, globalTasksContext.loadTasks]);

  const [crudError, setCrudError] = useState(null);

  const safeAction = (action) => async (...args) => {
    try {
      setCrudError(null);
      await action(...args);
    } catch (err) {
      setCrudError(err.message || "An error occurred while updating the task.");
    }
  };

  const { teams, members: teamMembers } = useTeam();
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

  const { currentTeam, columns, totalCount, completedCount } = useTaskBoardData(
    {
      tasks,
      teams,
      teamId,
      isTeamBoard,
      filters,
      currentUserId: user?.id,
    },
  );

  const assigneeOptions = useMemo(() => {
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
    removeTask: safeAction(removeTask),
    moveTaskColumn: safeAction(moveTaskColumn),
    toggleTaskStatus: safeAction(toggleTaskStatus),
  });
  const canEditSelectedTask =
    selectedTaskDetails && canEditTask(selectedTaskDetails);

  if (tasksError) {
    return (
      <div className="w-full">
        <TasksHeader
          isTeamBoard={isTeamBoard}
          currentTeam={currentTeam}
          teams={teams}
          teamId={teamId}
          navigate={navigate}
          teamMembers={teamMembers}
          totalCount={0}
          completedCount={0}
          canCreateTasks={false}
        />
        <div className="mt-md">
          <PageError
            icon="task"
            title="Tasks could not be loaded"
            description={tasksError}
            onRetry={() => loadTasks(teamId)}
          />
        </div>
      </div>
    );
  }

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

      {crudError && (
        <div className="p-md bg-error-container/20 border border-error/30 rounded-2xl text-error text-sm font-semibold flex items-center justify-between gap-sm animate-fade-in shadow-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {crudError}
          </div>
          <button onClick={() => setCrudError(null)} className="hover:bg-error/10 p-1 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

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
