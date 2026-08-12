import api from "@/api/client/axios";

const unwrapResponse = (response, fallback = null) => {
  return response.data?.data ?? response.data ?? fallback;
};

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return unwrapResponse(response, []);
};

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return unwrapResponse(response);
};
