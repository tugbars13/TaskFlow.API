import { createContext, useState, useEffect, useCallback } from "react";
import { useLocation, matchPath } from "react-router-dom";
import normalizeStatus from "../utils/normalizeStatus";
import useTaskActions from "../hooks/useTaskActions";
import useTaskLoader from "../hooks/useTaskLoader";
export const TaskContext = createContext();
export default function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const notifyChange = () => {
    setLastUpdated(Date.now());
  };
  const location = useLocation();

    const currentTeamId =
        matchPath({ path: "/teams/:teamId/tasks" }, location.pathname)?.params
            ?.teamId ?? null;
  const { loadTasks } = useTaskLoader({
    setTasks,
    setLoading,
    setError,
  });
  const {
  addTask,
  editTask,
  removeTask,
  toggleTaskStatus,
  moveTaskColumn,
} = useTaskActions({
  tasks,
  setTasks,
  setError,
  notifyChange,
  loadTasks,
  currentTeamId,
});
  useEffect(() => {
    loadTasks(currentTeamId);
  }, [loadTasks, currentTeamId]);


  return (
    <TaskContext.Provider
      value={{
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
