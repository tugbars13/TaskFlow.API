import useSettings from "@/features/settings/hooks/useSettings";
import SettingsSidebar from "@/features/settings/components/SettingsSidebar";
import ProfileSettings from "@/features/settings/components/ProfileSettings";
import WorkspaceSettings from "@/features/settings/components/WorkspaceSettings";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const {
    settings,
    activeSection,
    setActiveSection,
    loading,
    error,
    saveStatus,
    updateProfile,
    updateWorkspace,
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
          title="Account & Workspace Settings"
          subtitle="Manage your personal profile, notifications, security settings and workspace details."
          actions={<SaveIndicator status={saveStatus} />}
      />

      {/* 2-Column Bento Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column: Settings Navigation Sidebar */}
        <div className="lg:col-span-3">
          <SettingsSidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />
        </div>

        {/* Right Column: Settings Content Cards */}
        <div className="lg:col-span-9 space-y-xl">
          {/* Card 1: Profile Settings */}
          <ProfileSettings
            profile={settings?.profile}
            onSaveProfile={updateProfile}
          />

          {/* Card 2: Workspace Settings */}
          <WorkspaceSettings
            workspace={settings?.workspace}
            onSaveWorkspace={updateWorkspace}
          />
        </div>
      </div>
    </div>
  );
}
