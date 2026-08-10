import api from "@/api/client/axios";
const DEFAULT_PRIORITY = 2;
const DEFAULT_CATEGORY = 2;
const DEFAULT_STATUS = 1;
const COMPLETED_STATUS = 4;
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
const buildTaskPayload = (taskData) => ({
  title: taskData.title,
  description: taskData.description || "",
  priority:
    typeof taskData.priority === "number"
      ? taskData.priority
      : (PRIORITY_MAP[taskData.priority?.toLowerCase()] ?? DEFAULT_PRIORITY),
  category:
    typeof taskData.category === "number"
      ? taskData.category
      : (CATEGORY_MAP[taskData.category?.toLowerCase()] ?? DEFAULT_CATEGORY),
  dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
  assignedUserId: taskData.assignedUserId
    ? Number(taskData.assignedUserId)
    : null,
});

export const getTasks = async (teamId = null) => {
  const endpoint = teamId ? `/teams/${teamId}/tasks` : "/tasks";
  const response = await api.get(endpoint);
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
