import { useEffect, useState, useCallback } from "react";
import { getSettings, updateProfile, updateWorkspace } from "../api/settingsService";

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleProfileUpdate = async (profileData) => {
    setSaveStatus("saving");
    try {
      const updated = await updateProfile(profileData);
      setSettings((prev) => ({
        ...prev,
        profile: { ...prev?.profile, ...updated },
      }));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
      return true;
    } catch (err) {
      setSaveStatus("error");
      return false;
    }
  };

  const handleWorkspaceUpdate = async (workspaceData) => {
    setSaveStatus("saving");
    try {
      const updated = await updateWorkspace(workspaceData);
      setSettings((prev) => ({
        ...prev,
        workspace: { ...prev?.workspace, ...updated },
      }));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
      return true;
    } catch (err) {
      setSaveStatus("error");
      return false;
    }
  };

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
