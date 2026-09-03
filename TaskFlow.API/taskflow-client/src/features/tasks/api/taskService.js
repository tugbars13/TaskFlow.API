import api from "@/api/client/axios";
const DEFAULT_PRIORITY = 2;

const DEFAULT_STATUS = 1;
const COMPLETED_STATUS = 4;
const PRIORITY_MAP = {
  low: 1,
  medium: 2,
  high: 3,
};




const STATUS_MAP = {
  backlog: 1,
  todo: 2,
  inprogress: 3,
  in_progress: 3,
  completed: 4,
};
const buildTaskPayload = (taskData) => {
  console.log("BUILD PAYLOAD INPUT:", taskData);
  console.log("BUILD PAYLOAD CATEGORY ID:", taskData?.categoryId);

  const payload = {
    title: taskData.title,
    description: taskData.description || "",
    priority:
      typeof taskData.priority === "number"
        ? taskData.priority
        : (PRIORITY_MAP[taskData.priority?.toLowerCase()] ?? DEFAULT_PRIORITY),
    categoryId: taskData.categoryId,
    dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
    assignedUserId: taskData.assignedUserId
      ? Number(taskData.assignedUserId)
      : null,
  };

  if (taskData.assigneeIds !== undefined) {
    payload.assigneeIds = taskData.assigneeIds;
  }
  
  if (taskData.parentTaskId !== undefined) {
    payload.parentTaskId = taskData.parentTaskId;
  }

  return payload;
};

export const getTasks = async (teamId = null, filters = {}) => {
  const endpoint = teamId ? `/teams/${teamId}/tasks` : "/tasks";
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
      queryParams.append(key, filters[key]);
    }
  });

  const queryString = queryParams.toString();
  const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  const response = await api.get(finalEndpoint);
  return response.data?.data || response.data || [];
};

export const createTask = async (taskData) => {
  const payload = {
    ...buildTaskPayload(taskData),
    teamId: taskData.teamId ? Number(taskData.teamId) : null,
  };

  const response = await api.post("/tasks", payload);
  return response.data?.data || response.data;
};

export const updateTask = async (id, taskData) => {
  const statusVal =
    typeof taskData.status === "number"
      ? taskData.status
      : (STATUS_MAP[taskData.status?.toLowerCase()] ??
        (taskData.isCompleted ? COMPLETED_STATUS : DEFAULT_STATUS));

  const payload = {
    ...buildTaskPayload(taskData),
    isCompleted: Boolean(
      taskData.isCompleted || statusVal === COMPLETED_STATUS,
    ),
    status: statusVal,
  };

  const response = await api.put(`/tasks/${id}`, payload);
  return response.data?.data || response.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
  return true;
};

export const toggleTask = async (id) => {
  const response = await api.put(`/tasks/${id}/toggle`);
  return response.data?.data ?? response.data;
};

export const generateTaskBreakdown = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/breakdown`);
  return response.data?.data || response.data;
};

export const getAiTaskOrder = async () => {
  const response = await api.get("/tasks/ai-order");
  return response.data;
};
