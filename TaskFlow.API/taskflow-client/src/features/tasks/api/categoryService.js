import api from "@/api/client/axios";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data?.data || response.data || [];
};

export const createCategory = async (name) => {
  const response = await api.post("/categories", { name });
  return response.data?.data || response.data;
};
