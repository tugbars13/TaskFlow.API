import api from "@/api/axios";

export const getUsers = async () => {
  const response = await api.get("/Users");
  return response.data?.data || response.data || [];
};
