import { useState, useMemo, useCallback } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import useTeam from "@/features/teams/hooks/useTeam";
import useCalendar from "./useCalendar";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UPCOMING_DEADLINE_COUNT = 5;

/**
 * Page-level orchestration for the Calendar screen: day selection, the
 * derived task slices and the create-task / select-team modal flow.
 * Month navigation and fetching stay in useCalendar.
 */
export default function useCalendarPage() {
  const {
    currentMonthIndex,
    currentYear,
    navigateCalendar,
  } = useCalendar();

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    loadTasks,
    addTask,
    toggleTaskStatus,
    removeTask,
  } = useTasks();
  const { teams } = useTeam();

  const todayDate = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState(todayDate.getDate());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskModalData, setSelectedTaskModalData] = useState(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [isSelectTeamModalOpen, setIsSelectTeamModalOpen] = useState(false);
  const [selectedTeamForTask, setSelectedTeamForTask] = useState(null);

  const selectedDateText = useMemo(() => {
    if (
      selectedDay === todayDate.getDate() &&
      currentMonthIndex === todayDate.getMonth() &&
      currentYear === todayDate.getFullYear()
    ) {
      return "Today";
    }
    return `${MONTHS[currentMonthIndex]} ${selectedDay}, ${currentYear}`;
  }, [selectedDay, currentMonthIndex, currentYear, todayDate]);

  // Tasks for selected day
  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getDate() === selectedDay &&
        d.getMonth() === currentMonthIndex &&
        d.getFullYear() === currentYear
      );
    });
  }, [tasks, selectedDay, currentMonthIndex, currentYear]);

  // Upcoming deadlines (next 5)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) >= now)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, UPCOMING_DEADLINE_COUNT);
  }, [tasks]);

  const handleSelectDay = useCallback((day) => {
    setSelectedDay(day);
  }, []);

  const handleDoubleClickDay = useCallback(
    (day) => {
      setSelectedDay(day);
      const monthStr = String(currentMonthIndex + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const formattedDueDate = `${currentYear}-${monthStr}-${dayStr}`;

      setSelectedTaskModalData({ dueDate: formattedDueDate });

      if (teams.length === 1) {
        setSelectedTeamForTask(teams[0].id);
        setIsTaskModalOpen(true);
      } else if (teams.length > 1) {
        setIsSelectTeamModalOpen(true);
      } else {
        setIsTaskModalOpen(true);
      }
    },
    [currentMonthIndex, currentYear, teams],
  );

  const handleCreateTaskModal = useCallback(
    async (taskData) => {
      await addTask({ ...taskData, teamId: selectedTeamForTask });
      setIsTaskModalOpen(false);
      setSelectedTaskModalData(null);
      setSelectedTeamForTask(null);
    },
    [addTask],
  );

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTaskModalData(null);
    setSelectedTeamForTask(null);
  }, []);

  const handleSelectTeam = useCallback((teamId) => {
    setSelectedTeamForTask(teamId);
    setIsTaskModalOpen(true);
  }, []);

  const handleRefetch = useCallback(() => {
    loadTasks(null); // Calendar is global, so it fetches all tasks
  }, [loadTasks]);

  return {
    // calendar
    currentMonthIndex,
    currentYear,
    navigateCalendar,
    refetch: handleRefetch,

    // status
    loading: tasksLoading,
    error: tasksError,

    // derived data
    tasks,
    selectedDay,
    selectedDateText,
    selectedDayTasks,
    upcomingDeadlines,
    teams,

    // day interaction
    handleSelectDay,
    handleDoubleClickDay,

    // task details modal
    selectedTaskDetails,
    setSelectedTaskDetails,
    toggleTaskStatus,
    removeTask,

    // create-task flow
    isTaskModalOpen,
    selectedTaskModalData,
    selectedTeamForTask,
    handleCreateTaskModal,
    handleCloseTaskModal,

    // select-team flow
    isSelectTeamModalOpen,
    setIsSelectTeamModalOpen,
    handleSelectTeam,
  };
}
