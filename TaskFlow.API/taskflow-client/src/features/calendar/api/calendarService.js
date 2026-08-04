import api from "@/api/axios";

export const getCalendarEvents = async () => {
  try {
    const response = await api.get("/Calendar/events");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.warn("Calendar API endpoint error:", error);
    return [];
  }
};
