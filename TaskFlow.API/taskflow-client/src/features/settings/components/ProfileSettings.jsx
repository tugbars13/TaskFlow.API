import { useState, useEffect, useCallback } from "react";
import AvatarUploader from "./AvatarUploader";
import ProfileForm from "./ProfileForm";

export default function ProfileSettings({ profile, onSaveProfile }) {
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    setAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile]);

  const handleFormSave = useCallback(
    (formData) => {
      onSaveProfile?.({
        ...formData,
        avatarUrl,
      });
    },
    [avatarUrl, onSaveProfile],
  );
  const handleCancel = useCallback(() => {
    setAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile]);
  return (
    <div className="bg-surface rounded-2xl p-lg border border-outline-variant/10 apple-shadow space-y-lg">
      <div>
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
          Profile Settings
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Update your photo, personal details, and public profile information.
        </p>
      </div>

      <AvatarUploader avatarUrl={avatarUrl} onChangeAvatar={setAvatarUrl} />

      <ProfileForm
        initialValues={profile}
        onSave={handleFormSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
