import { useEffect, useState, useCallback } from "react";
import {
  getSettings,
  updateProfile,
  updateWorkspace,
} from "../api/settingsService";

const SAVE_STATUS_DURATION = 3000;
export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [activeSection, setActiveSection] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);
  const resetSaveStatus = useCallback(() => {
    setTimeout(() => {
      setSaveStatus(null);
    }, SAVE_STATUS_DURATION);
  }, []);
  const updateSettingsSection = useCallback(
    async (section, apiCall, data) => {
      setSaveStatus("saving");

      try {
        const updated = await apiCall(data);

        setSettings((prev) => ({
          ...prev,
          [section]: {
            ...prev?.[section],
            ...updated,
          },
        }));

        setSaveStatus("success");
        resetSaveStatus();

        return true;
      } catch {
        setSaveStatus("error");
        return false;
      }
    },
    [resetSaveStatus],
  );
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleProfileUpdate = useCallback(
    (profileData) => {
      return updateSettingsSection("profile", updateProfile, profileData);
    },
    [updateSettingsSection],
  );

  const handleWorkspaceUpdate = useCallback(
    (workspaceData) => {
      return updateSettingsSection("workspace", updateWorkspace, workspaceData);
    },
    [updateSettingsSection],
  );

  return {
    settings,
    activeSection,
    setActiveSection,
    loading,
    error,
    saveStatus,
    updateProfile: handleProfileUpdate,
    updateWorkspace: handleWorkspaceUpdate,
    refetch: fetchSettings,
  };
}
