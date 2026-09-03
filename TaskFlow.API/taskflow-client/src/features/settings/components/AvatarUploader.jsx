import useUpload from "@/features/myspace/hooks/useUpload";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";

export default function AvatarUploader({ avatarUrl, onChangeAvatar }) {
  const {
    isUploading,
    urlError,
    fileInputRef,
    handleFileUpload,
  } = useUpload({
    type: 'image',
    onUploadSuccess: (data) => {
      if (data && data.url) {
        onChangeAvatar?.(data.url);
      }
    }
  });

  return (
    <div className="flex items-center gap-lg pb-lg border-b border-outline-variant/10">
      <div className="relative w-20 h-20 shrink-0">
        <img
          src={avatarUrl || DEFAULT_AVATAR}
          alt="Profile Avatar"
          className="w-full h-full rounded-2xl object-cover apple-shadow border-2 border-surface"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
          </div>
        )}
      </div>

      <div className="space-y-xs">
        <div className="flex items-center gap-sm flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-lg py-xs bg-primary text-on-primary font-bold text-xs rounded-xl apple-shadow active:scale-95 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? "Yükleniyor..." : "Change Photo"}
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => onChangeAvatar?.("")}
            className="px-md py-xs text-on-surface-variant font-semibold text-xs rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
          >
            Remove
          </button>
        </div>
        <p className="text-[11px] text-on-surface-variant">
          JPG, GIF or PNG. Max size 5MB.
        </p>
        {urlError && <p className="text-[11px] text-error font-medium">{urlError}</p>}
      </div>
    </div>
  );
}
