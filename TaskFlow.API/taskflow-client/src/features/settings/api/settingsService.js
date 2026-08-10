const DEFAULT_SETTINGS = Object.freeze({
  profile: {
    fullName: "Alex Rivera",
    displayName: "alexrivera",
    email: "alex@taskflow.pro",
    bio: "Senior Frontend Software Architect & Lead Product Designer at TaskFlow Pro.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
  workspace: {
    name: "TaskFlow Enterprise Workspace",
    url: "https://taskflow.pro/w/enterprise-tech",
    logoUrl: "",
  },
});
import api from "@/api/client/axios";
const SETTINGS_ENDPOINT = "/Settings";
export const getSettings = async () => {
  try {
    const response = await api.get(SETTINGS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.warn(
      "Settings API endpoint unavailable, using default profile settings.",
      error,
    );

    return DEFAULT_SETTINGS;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put(`${SETTINGS_ENDPOINT}/Profile`, profileData);
    return response.data;
  } catch (error) {
    console.warn("Settings Profile update API endpoint unavailable.", error);
    return profileData;
  }
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
