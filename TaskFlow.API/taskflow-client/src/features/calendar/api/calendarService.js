import api from "@/api/client/axios";

export const getCalendarEvents = async () => {
  const response = await api.get("/Calendar/events");
  return response.data?.data ?? [];
};
