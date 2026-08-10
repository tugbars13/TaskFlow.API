import { useEffect, useState } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";
import { getTasks } from "@/features/tasks/api/taskService";
import { ERROR_MESSAGES } from "@/constants/errorConstants";

export default function useAnalyticsTasks() {
  const { tasks: contextTasks } = useTasks();
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    if (Array.isArray(contextTasks) && contextTasks.length > 0) {
      setLocalTasks(contextTasks);
      return;
    }

    getTasks()
      .then((data) => {
        if (Array.isArray(data)) {
          setLocalTasks(data);
        }
      })
      .catch((error) => {
        console.error(ERROR_MESSAGES.ANALYTICS_TASKS_LOAD_FAILED, error);
      });
  }, [contextTasks]);

  const tasks = localTasks.length > 0 ? localTasks : (contextTasks ?? []);

  return tasks;
}
