import api from "@/api/client/axios";
import { getCurrentUser } from "@/features/auth/api/authService";

const DEFAULT_WORKSPACE = {
  name: "TaskFlow Enterprise Workspace",
  url: "https://taskflow.pro/w/enterprise-tech",
  logoUrl: "",
};

export const getSettings = async () => {
  try {
    const user = await getCurrentUser();
    return {
      profile: {
        fullName: user.fullName || "",
        displayName: user.displayName || "",
        email: user.email || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      },
      workspace: DEFAULT_WORKSPACE,
    };
  } catch (error) {
    console.error("Failed to fetch settings from Auth/me", error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  console.log("=== [5] SETTINGS SERVICE UPDATE PROFILE ===");
  console.log("profileData:", profileData);
  console.log("=== [6] BEFORE AXIOS PUT ===");
  const response = await api.put("/Auth/profile", {
    fullName: profileData.fullName,
    displayName: profileData.displayName,
    bio: profileData.bio,
    avatarUrl: profileData.avatarUrl,
  });
  console.log("=== [7] NETWORK REQUEST SUCCESS ===");
  return response.data;
};

export const updateWorkspace = async (workspaceData) => {
  try {
    const response = await api.put(
      `${SETTINGS_ENDPOINT}/Workspace`,
      workspaceData,
    );
    return response.data;
  } catch (error) {
    console.warn("Settings Workspace update API endpoint unavailable.", error);
    return workspaceData;
  }
};
