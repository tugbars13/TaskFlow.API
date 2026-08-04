import api from "@/api/axios";

export const getAnalyticsMetrics = async () => {
  const response = await api.get("/analytics/metrics");
  return response.data?.data || response.data;
};
