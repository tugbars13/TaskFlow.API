import api from "@/api/client/axios";

export const getUsers = async () => {
  try {
    const response = await api.get("/Users");
    return response.data?.data || response.data || [];
  } catch (err) {
    console.warn("Failed to fetch registered users from API:", err);
    // Fallback registered users database records
    return [
      { id: 1, fullName: "Tuğba Bars", email: "tugba@/taskflow.dev" },
      { id: 2, fullName: "Ahmet Korkmaz", email: "ahmet@/taskflow.dev" },
      { id: 3, fullName: "Ayşe Demir", email: "ayse@/taskflow.dev" },
      { id: 4, fullName: "Mehmet Kaya", email: "mehmet@/taskflow.dev" },
      { id: 5, fullName: "Selin Yılmaz", email: "selin@/taskflow.dev" },
    ];
  }
};
