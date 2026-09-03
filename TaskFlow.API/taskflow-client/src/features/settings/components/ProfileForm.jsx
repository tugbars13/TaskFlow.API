import { useState, useEffect } from "react";
const EMPTY_PROFILE = Object.freeze({
  fullName: "",
  displayName: "",
  email: "",
  bio: "",
});
export default function ProfileForm({ initialValues, onSave, onCancel }) {
  const [formData, setFormData] = useState(EMPTY_PROFILE);

  useEffect(() => {
    if (!initialValues) {
      setFormData(EMPTY_PROFILE);
      return;
    }

    setFormData({
      ...EMPTY_PROFILE,
      ...initialValues,
    });
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("=== [1] PROFILE FORM SUBMIT ===");
    onSave?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-lg pt-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Full Name */}
        <div className="space-y-xs">
          <label className="text-xs font-bold text-on-surface">Full Name</label>
          <input
            type="text"
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 apple-shadow transition-colors"
          />
        </div>

        {/* Display Name */}
        <div className="space-y-xs">
          <label className="text-xs font-bold text-on-surface">
            Display Name / Handle
          </label>
          <input
            type="text"
            value={formData.displayName || ""}
            onChange={(e) => handleChange("displayName", e.target.value)}
            placeholder="e.g. alexrivera"
            className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 apple-shadow transition-colors"
          />
        </div>
      </div>

      {/* Email Address */}
      <div className="space-y-xs">
        <label className="text-xs font-bold text-on-surface">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          readOnly
          placeholder="name@company.com"
          className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 apple-shadow transition-colors opacity-70 cursor-not-allowed"
        />
      </div>

      {/* Bio / Description */}
      <div className="space-y-xs">
        <label className="text-xs font-bold text-on-surface">Bio</label>
        <textarea
          rows={3}
          value={formData.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Brief summary about your role and responsibilities..."
          className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 apple-shadow transition-colors resize-none"
        />
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-lg py-sm text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-lg py-sm bg-primary text-on-primary font-bold text-xs rounded-xl apple-shadow active:scale-95 hover:bg-primary/90 transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
