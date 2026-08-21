import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { loadTasks } = useTaskLoader({
    setTasks,
    setLoading,
    setError,
  });

  const { addTask, editTask, removeTask, toggleTaskStatus, moveTaskColumn } =
    useTaskActions({
      tasks,
      setTasks,
      setError,
      notifyChange,
      loadTasks,
      currentTeamId: null, // Global TaskContext doesn't track active team anymore
    });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Load all workspace tasks exactly once on authentication
    loadTasks(null);
  }, [authLoading, isAuthenticated, loadTasks]);

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
    ]
  );

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}
