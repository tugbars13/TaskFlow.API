import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation, matchPath } from "react-router-dom";
import normalizeStatus from "../utils/normalizeStatus";
import useTaskActions from "../hooks/useTaskActions";
import useTaskLoader from "../hooks/useTaskLoader";
import useAuth from "@/features/auth/hooks/useAuth";
export const TaskContext = createContext();
export default function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const notifyChange = useCallback(() => {
    setLastUpdated(Date.now());
  }, []);
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadTasks } = useTaskLoader({
    setTasks,
    setLoading,
    setError,
  });

  const currentTeamId = useMemo(() => {
    return (
      matchPath({ path: "/teams/:teamId/tasks" }, location.pathname)?.params
        ?.teamId ?? null
    );
  }, [location.pathname]);
  const { addTask, editTask, removeTask, toggleTaskStatus, moveTaskColumn } =
    useTaskActions({
      tasks,
      setTasks,
      setError,
      notifyChange,
      loadTasks,
      currentTeamId,
    });
  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  }, [location.search]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadTasks(currentTeamId, currentFilters);
  }, [authLoading, isAuthenticated, loadTasks, currentTeamId, currentFilters]);
  const contextValue = useMemo(
    () => ({
      tasks,
      loading,
      error,
      lastUpdated,
      loadTasks,
      addTask,
      editTask,
      removeTask,
      toggleTaskStatus,
      moveTaskColumn,
    }),
    [
      tasks,
      loading,
      error,
      lastUpdated,
      loadTasks,
      addTask,
      editTask,
      removeTask,
      toggleTaskStatus,
      moveTaskColumn,
    ],
  );
  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}
