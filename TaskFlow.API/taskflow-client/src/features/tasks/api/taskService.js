import api from "@/api/client/axios";

const PRIORITY_MAP = {
  low: 1,
  medium: 2,
  high: 3,
};

const CATEGORY_MAP = {
  personal: 1,
  work: 2,
  study: 3,
  shopping: 4,
  health: 5,
  "design system": 1,
  backend: 2,
  frontend: 2,
  marketing: 4,
  qa: 3,
  "team sync": 5,
  general: 2,
};

const STATUS_MAP = {
  backlog: 1,
  todo: 2,
  inprogress: 3,
  in_progress: 3,
  completed: 4,
};

export const getTasks = async (teamId = null) => {
  const endpoint = teamId ? `/teams/${teamId}/tasks` : "/tasks";
  const response = await api.get(endpoint);
  return response.data?.data || response.data || [];
};

export const createTask = async (taskData) => {
  const payload = {
    title: taskData.title,
    description: taskData.description || "",
    priority: typeof taskData.priority === "number"
      ? taskData.priority
      : (PRIORITY_MAP[taskData.priority?.toLowerCase()] || 2),
    category: typeof taskData.category === "number"
      ? taskData.category
      : (CATEGORY_MAP[taskData.category?.toLowerCase()] || 2),
    dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
    assignedUserId: taskData.assignedUserId ? Number(taskData.assignedUserId) : null,
    teamId: taskData.teamId ? Number(taskData.teamId) : null,
  };

  const response = await api.post("/tasks", payload);
  return response.data?.data || response.data;
};

export const updateTask = async (id, taskData) => {
  const statusVal = typeof taskData.status === "number"
    ? taskData.status
    : (STATUS_MAP[taskData.status?.toLowerCase()] || (taskData.isCompleted ? 4 : 1));

  const payload = {
    title: taskData.title,
    description: taskData.description || "",
    isCompleted: Boolean(taskData.isCompleted || statusVal === 4),
    status: statusVal,
    priority: typeof taskData.priority === "number"
      ? taskData.priority
      : (PRIORITY_MAP[taskData.priority?.toLowerCase()] || 2),
    category: typeof taskData.category === "number"
      ? taskData.category
      : (CATEGORY_MAP[taskData.category?.toLowerCase()] || 2),
    dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
    assignedUserId: taskData.assignedUserId ? Number(taskData.assignedUserId) : null,
  };

  const response = await api.put(`/tasks/${id}`, payload);
  return response.data?.data || response.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
  return true;
};