import { useEffect, useState, useCallback, useContext } from "react";
import { getCalendarEvents } from "../api/calendarService";
import { TaskContext } from "@/features/tasks/context/TaskContext";

export default function useCalendar() {
  const taskCtx = useContext(TaskContext);
  const lastUpdated = taskCtx?.lastUpdated;

  const [events, setEvents] = useState({});
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarEvents();
      const eventsList = Array.isArray(data) ? data : [];

      const eventsMap = {};
      eventsList.forEach((evt) => {
        const evtDate = new Date(evt.startDate);
        const day = evtDate.getDate();
        eventsMap[day] = {
          id: evt.id,
          title: evt.title,
          style: evt.color || "bg-indigo-50/80 text-indigo-700",
          category: evt.category,
          startDate: evt.startDate,
          endDate: evt.endDate,
          isAllDay: evt.isAllDay,
        };
      });

      setEvents(eventsMap);
    } catch (err) {
      setError(err.message ?? "Failed to load calendar events.");
      setEvents({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, lastUpdated]);

  const navigateCalendar = (direction) => {
    setCurrentMonthIndex((prevMonth) => {
      let nextMonth = prevMonth + direction;
      if (nextMonth > 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      if (nextMonth < 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return nextMonth;
    });
  };

  const resetToToday = () => {
    setCurrentMonthIndex(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
    setViewMode("month");
  };

  return {
    events,
    currentMonthIndex,
    currentYear,
    viewMode,
    loading,
    error,
    setViewMode,
    navigateCalendar,
    resetToToday,
    refetch: fetchEvents,
  };
}
