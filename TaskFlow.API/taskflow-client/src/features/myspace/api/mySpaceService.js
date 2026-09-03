import api from "@/api/client/axios";

export const getFolders = async () => {
  return await api.get("/myspace/folders");
};

export const getPages = async () => {
  return await api.get("/myspace/pages");
};

export const createFolder = async (data) => {
  return await api.post("/myspace/folders", data);
};

export const updateFolder = async (id, data) => {
  return await api.put(`/myspace/folders/${id}`, data);
};

export const deleteFolder = async (id) => {
  return await api.delete(`/myspace/folders/${id}`);
};

export const createPage = async (data) => {
  return await api.post("/myspace/pages", data);
};

export const updatePage = async (id, data) => {
  return await api.put(`/myspace/pages/${id}`, data);
};

export const deletePage = async (id) => {
  return await api.delete(`/myspace/pages/${id}`);
};
