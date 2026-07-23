import api from "./api";

export const getTasks = async () => {
    const response = await api.get("/tasks");
    return response.data;
};

export const createTask = async (task) => {
    const response = await api.post("/tasks", task);
    return response.data;
};

export const updateTask = async (id, task) => {
    await api.put(`/tasks/${id}`, task);
};

export const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
};

export const toggleTask = async (id) => {
    await api.put(`/tasks/${id}/toggle`);
};