import api from "@/api/client/axios";

export const getUsers = async () => {
  const response = await api.get("/Users");
  return response.data?.data || response.data || [];
};
