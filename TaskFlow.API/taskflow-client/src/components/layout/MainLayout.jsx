import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import SelectTeamModal from "@/features/tasks/teams/components/SelectTeamModal";
import useTasks from "@/features/tasks/hooks/useTasks";
import useTeam from "@/features/teams/hooks/useTeam";

export default function MainLayout({ children, onQuickAdd }) {
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);
  const [isSelectTeamModalOpen, setIsSelectTeamModalOpen] = useState(false);
  const [selectedTeamForTask, setSelectedTeamForTask] = useState(null);

  const { addTask } = useTasks();
  const { teams } = useTeam();

  const handleGlobalNewTask = () => {
    if (onQuickAdd) {
      onQuickAdd();
    } else {
      if (teams.length === 1) {
        setSelectedTeamForTask(teams[0].id);
        setIsGlobalTaskModalOpen(true);
      } else if (teams.length > 1) {
        setIsSelectTeamModalOpen(true);
      } else {
        // Fallback if no teams
        setIsGlobalTaskModalOpen(true);
      }
    }
  };

  const handleTaskSubmit = async (taskData) => {
    await addTask(taskData);
    setIsGlobalTaskModalOpen(false);
    setSelectedTeamForTask(null);
  };

  return (
    <div className="min-h-screen bg-background-canvas text-on-surface">
      <Sidebar />

      <Navbar onNewTask={handleGlobalNewTask} />

      {/* Main Content Canvas */}
      <main className="ml-[var(--spacing-sidebar-width)] min-h-[calc(100vh-72px)] pt-lg pb-xl px-lg md:px-xl transition-all duration-300">
        <div className="max-w-[var(--spacing-container-max)] mx-auto space-y-xl">
          {children || <Outlet />}
        </div>
      </main>

      {/* Global Team Selection Modal */}
      <SelectTeamModal
        isOpen={isSelectTeamModalOpen}
        onClose={() => setIsSelectTeamModalOpen(false)}
        teams={teams}
        onSelectTeam={(teamId) => {
          setSelectedTeamForTask(teamId);
          setIsGlobalTaskModalOpen(true);
        }}
      />

      {/* Global Task Creation Modal */}
      <TaskFormModal
        isOpen={isGlobalTaskModalOpen}
        onClose={() => {
          setIsGlobalTaskModalOpen(false);
          setSelectedTeamForTask(null);
        }}
        onSubmit={handleTaskSubmit}
        teamId={selectedTeamForTask}
      />
    </div>
  );
}
