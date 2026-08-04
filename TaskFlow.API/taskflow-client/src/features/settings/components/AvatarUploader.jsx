import { useRef } from "react";

export default function AvatarUploader({ avatarUrl, onChangeAvatar }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChangeAvatar?.(url);
    }
  };

  return (
    <div className="flex items-center gap-lg pb-lg border-b border-outline-variant/10">
      <img
        src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
        alt="Profile Avatar"
        className="w-20 h-20 rounded-2xl object-cover apple-shadow border-2 border-surface"
      />

      <div className="space-y-xs">
        <div className="flex items-center gap-sm flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-lg py-xs bg-primary text-on-primary font-bold text-xs rounded-xl apple-shadow active:scale-95 hover:bg-primary/90 transition-all cursor-pointer"
          >
            Change Photo
          </button>
          <button
            type="button"
            onClick={() => onChangeAvatar?.("")}
            className="px-md py-xs text-on-surface-variant font-semibold text-xs rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
        <p className="text-[11px] text-on-surface-variant">
          JPG, GIF or PNG. Max size 5MB.
        </p>
      </div>
    </div>
  );
}
