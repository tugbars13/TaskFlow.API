import { useState } from "react";

export default function useTaskBoard({
    tasks,
    teams,
    teamId,
    isTeamBoard,
    canEditTask,
    addTask,
    removeTask,
    moveTaskColumn,
    toggleTaskStatus,
}) {
    const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSelectTeamModalOpen, setIsSelectTeamModalOpen] = useState(false);
    const [selectedTeamForTask, setSelectedTeamForTask] = useState(null);
    const handleDeleteTask = async (id) => {
        await removeTask(id);
        setSelectedTaskDetails(null);
    };

    const handleOpenNewTaskModal = () => {
        if (isTeamBoard) {
            setSelectedTeamForTask(Number(teamId));
            setIsFormModalOpen(true);
            return;
        }

        if (teams.length === 1) {
            setSelectedTeamForTask(teams[0].id);
            setIsFormModalOpen(true);
        } else if (teams.length > 1) {
            setIsSelectTeamModalOpen(true);
        } else {
            setIsFormModalOpen(true);
        }
    };

    const handleFormSubmit = async (data) => {
        await addTask(data);
        setIsFormModalOpen(false);
        setSelectedTeamForTask(null);
    };

    const handleDragDropTask = (taskId, statusId) => {
        const task = tasks.find((t) => t.id === taskId);

        if (!task || !canEditTask(task)) return;

        moveTaskColumn(taskId, statusId);
    };

    const handleToggleStatus = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);

        if (!task || !canEditTask(task)) return;

        toggleTaskStatus(taskId);
    };
    const handleSelectTeam = (teamId) => {
        setSelectedTeamForTask(teamId);
        setIsSelectTeamModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setSelectedTeamForTask(null);
    };

    const handleCloseSelectTeam = () => {
        setIsSelectTeamModalOpen(false);
    };
    const handleCloseTaskDetails = () => {
        setSelectedTaskDetails(null);
    };
    return {
        selectedTaskDetails,
        setSelectedTaskDetails,

        isFormModalOpen,
        setIsFormModalOpen,

        isSelectTeamModalOpen,
        setIsSelectTeamModalOpen,

        selectedTeamForTask,
        setSelectedTeamForTask,

        handleOpenNewTaskModal,
        handleFormSubmit,
        handleDragDropTask,
        handleToggleStatus,
        handleDeleteTask,
        handleCloseSelectTeam,
        handleCloseTaskDetails,
    };
}