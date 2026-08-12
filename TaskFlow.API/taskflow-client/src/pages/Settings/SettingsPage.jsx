import useSettings from "@/features/settings/hooks/useSettings";
import ProfileSettings from "@/features/settings/components/ProfileSettings";
import NotificationSettings from "@/features/settings/components/NotificationSettings";
import DangerZone from "@/features/settings/components/DangerZone";
import {
  PageHeader,
  PageLoading,
  PageError,
  SaveIndicator,
} from "@/components/common";

export default function SettingsPage() {
  const {
    settings,
    loading,
    error,
    saveStatus,
    updateProfile,
    refetch,
  } = useSettings();

  if (loading) {
    return (
        <PageLoading
            message="Loading settings & preferences..."
        />
    );
}

  if (error) {
  return (
    <PageError
      icon="settings"
      title="Settings could not be loaded"
      description={error}
      onRetry={refetch}
    />
  );
}

  return (
    <div className="space-y-xl pb-xl transition-all duration-300">
      {/* Page Header */}
      <PageHeader
          icon="settings"
          title="Account Settings"
          subtitle="Manage your personal profile and notifications."
          actions={<SaveIndicator status={saveStatus} />}
      />

      {/* Unified Settings Content */}
      <div className="max-w-[1100px] mx-auto w-full space-y-6">
        <ProfileSettings
          profile={settings?.profile}
          onSaveProfile={updateProfile}
        />

        <NotificationSettings onSave={() => {}} />

        <DangerZone />
      </div>
    </div>
  );
}
