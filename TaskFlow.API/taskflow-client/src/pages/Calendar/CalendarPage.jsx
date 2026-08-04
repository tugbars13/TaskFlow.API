import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import useCalendar from "@/features/calendar/hooks/useCalendar";
import useTasks from "@/features/tasks/hooks/useTasks";
import useTeam from "@/features/teams/hooks/useTeam";
import CalendarGrid from "@/features/calendar/components/CalendarGrid";
import TodayScheduleCard from "@/features/calendar/components/TodayScheduleCard";
import UpcomingDeadlinesCard from "@/features/calendar/components/UpcomingDeadlinesCard";
import TaskFormModal from "@/features/tasks/components/TaskFormModal";
import TaskDetailsModal from "@/features/tasks/components/TaskDetailsModal";
import SelectTeamModal from "@/features/tasks/teams/components/SelectTeamModal";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const {
    currentMonthIndex,
    currentYear,
    loading: calendarLoading,
    error: calendarError,
    navigateCalendar,
    refetch,
  } = useCalendar();

  const { tasks, loading: tasksLoading, addTask, toggleTaskStatus, removeTask } = useTasks();
  const { teams } = useTeam();

  const todayDate = new Date();
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
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const handleDoubleClickDay = (day) => {
    setSelectedDay(day);
    const monthStr = String(currentMonthIndex + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formattedDueDate = `${currentYear}-${monthStr}-${dayStr}`;

    setSelectedTaskModalData({
      dueDate: formattedDueDate,
    });

    if (teams.length === 1) {
      setSelectedTeamForTask(teams[0].id);
      setIsTaskModalOpen(true);
    } else if (teams.length > 1) {
      setIsSelectTeamModalOpen(true);
    } else {
      setIsTaskModalOpen(true);
    }
  };

  const handleCreateTaskModal = async (taskData) => {
    await addTask(taskData);
    setIsTaskModalOpen(false);
    setSelectedTaskModalData(null);
    setSelectedTeamForTask(null);
    refetch();
  };

  if (calendarLoading || tasksLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-2xl bg-surface-container-lowest rounded-3xl apple-shadow border border-outline-variant/10 min-h-[400px]">
        <Spinner size="lg" ariaLabel="Loading calendar" />
        <p className="text-body-sm text-on-surface-variant mt-md">Loading schedule milestones...</p>
      </div>
    );
  }

  if (calendarError) {
    return (
      <div className="p-xl bg-surface rounded-3xl border border-error/20 apple-shadow text-center space-y-md my-xl">
        <span className="material-symbols-outlined text-[48px] text-error">event_busy</span>
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
          Calendar schedule could not be loaded
        </h3>
        <p className="text-body-md text-on-surface-variant max-w-md mx-auto">{calendarError}</p>
        <Button onClick={refetch} variant="primary" className="mt-md">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-xl pb-xl transition-all duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/10 pb-lg">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center apple-shadow shrink-0">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-display-lg text-display-lg font-extrabold text-on-surface leading-none">
              Calendar
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-none">
              Your schedule at a glance.
            </p>
          </div>
        </div>

        {/* Centered Month Selector */}
        <div className="flex items-center gap-xs bg-surface-container-lowest border border-outline-variant/10 p-1.5 rounded-2xl apple-shadow">
          <button
            type="button"
            onClick={() => navigateCalendar(-1)}
            aria-label="Previous month"
            className="p-1.5 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container-high transition-all cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="font-headline-md text-headline-md font-bold text-on-surface px-md min-w-[160px] text-center select-none">
            {MONTHS[currentMonthIndex]} {currentYear}
          </span>
          <button
            type="button"
            onClick={() => navigateCalendar(1)}
            aria-label="Next month"
            className="p-1.5 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container-high transition-all cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* LEFT SIDE (65% / 8 Columns): Large Monthly Calendar */}
        <div className="lg:col-span-8">
          <CalendarGrid
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            tasks={tasks}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            onDoubleClickDay={handleDoubleClickDay}
          />
        </div>

        {/* RIGHT SIDEBAR (35% / 4 Columns): Order 1. Upcoming Deadlines, 2. Today's Schedule */}
        <div className="lg:col-span-4 space-y-xl">
          {/* Card 1: Upcoming Deadlines */}
          <UpcomingDeadlinesCard
            deadlines={upcomingDeadlines}
            onViewAll={() => navigate(ROUTES.TASKS)}
            onTaskClick={setSelectedTaskDetails}
          />

          {/* Card 2: Today's Schedule */}
          <TodayScheduleCard
            selectedDateText={selectedDateText}
            tasks={selectedDayTasks}
            onTaskClick={setSelectedTaskDetails}
          />
        </div>
      </div>

      {/* Centered Task Details Modal */}
      <TaskDetailsModal
        isOpen={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        task={selectedTaskDetails}
        onToggleStatus={toggleTaskStatus}
        onDeleteTask={removeTask}
      />

      {/* Team Selection Modal */}
      <SelectTeamModal
        isOpen={isSelectTeamModalOpen}
        onClose={() => setIsSelectTeamModalOpen(false)}
        teams={teams}
        onSelectTeam={(teamId) => {
          setSelectedTeamForTask(teamId);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTaskModalData(null);
          setSelectedTeamForTask(null);
        }}
        onSubmit={handleCreateTaskModal}
        initialData={selectedTaskModalData}
        teamId={selectedTeamForTask}
      />
    </div>
  );
}
