import { useState, useCallback } from "react";

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
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSelectTeamModalOpen, setIsSelectTeamModalOpen] = useState(false);
    const [selectedTeamForTask, setSelectedTeamForTask] = useState(null);

    const selectedTaskDetails = tasks.find(t => t.id === selectedTaskId) || null;

    const getEditableTask = useCallback((taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task || !canEditTask(task)) return null;
        return task;
    }, [tasks, canEditTask]);

    const handleDeleteTask = useCallback(async (id) => {
        await removeTask(id);
        setSelectedTaskId(null);
    }, [removeTask]);

    const handleOpenNewTaskModal = useCallback(() => {
        if (isTeamBoard) {
            setSelectedTeamForTask(Number(teamId));
            setIsFormModalOpen(true);
        } else {
            // Personal Task mode
            setSelectedTeamForTask(null);
            setIsFormModalOpen(true);
        }
    }, [isTeamBoard, teamId]);

    const handleFormSubmit = useCallback(async (data) => {
        await addTask({ ...data, teamId: selectedTeamForTask || Number(teamId) || null });
        setIsFormModalOpen(false);
        setSelectedTeamForTask(null);
    }, [addTask, selectedTeamForTask, teamId]);

    const handleDragDropTask = useCallback((taskId, statusId) => {
        const task = getEditableTask(taskId);
        if (!task) return;

        moveTaskColumn(taskId, statusId);
    }, [getEditableTask, moveTaskColumn]);

    const handleToggleStatus = useCallback((taskId) => {
        const task = getEditableTask(taskId);
        if (!task) return;

        toggleTaskStatus(taskId);
    }, [getEditableTask, toggleTaskStatus]);

    const handleSelectTeam = useCallback((teamId) => {
        setSelectedTeamForTask(teamId);
        setIsSelectTeamModalOpen(false);
        setIsFormModalOpen(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsFormModalOpen(false);
        setSelectedTeamForTask(null);
    }, []);

    const handleCloseSelectTeam = useCallback(() => {
        setIsSelectTeamModalOpen(false);
    }, []);

    const handleSelectTaskDetails = useCallback((task) => {
        setSelectedTaskId(task.id);
    }, []);

    const handleCloseTaskDetails = useCallback(() => {
        setSelectedTaskId(null);
    }, []);

    return {
        selectedTaskDetails,
        isFormModalOpen,
        isSelectTeamModalOpen,
        selectedTeamForTask,

        handleSelectTaskDetails,
        handleCloseTaskDetails,
        handleOpenNewTaskModal,
        handleCloseForm,
        handleSelectTeam,
        handleCloseSelectTeam,
        
        handleFormSubmit,
        handleDragDropTask,
        handleToggleStatus,
        handleDeleteTask,
    };
}
