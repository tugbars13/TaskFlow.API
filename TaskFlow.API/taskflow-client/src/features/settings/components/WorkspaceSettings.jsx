import { useState, useEffect } from "react";

export default function WorkspaceSettings({ workspace, onSaveWorkspace }) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        url: workspace.url || "",
        logoUrl: workspace.logoUrl || "",
      });
    }
  }, [workspace]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveWorkspace?.(formData);
  };

  return (
    <div className="bg-surface rounded-2xl p-lg border border-outline-variant/10 apple-shadow space-y-lg">
      <div className="flex items-center justify-between pb-md border-b border-outline-variant/10">
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            Workspace Settings
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage organization branding, custom domain, and workspace permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-lg py-xs bg-secondary text-on-secondary font-bold text-xs rounded-xl apple-shadow active:scale-95 hover:bg-secondary/90 transition-all cursor-pointer"
        >
          Manage Workspace
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-lg">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-secondary/20">
            WS
          </div>
          <div className="flex-1 space-y-xs">
            <label className="text-xs font-bold text-on-surface">Workspace Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. TaskFlow Enterprise"
              className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 apple-shadow transition-colors"
            />
          </div>
        </div>

        <div className="space-y-xs">
          <label className="text-xs font-bold text-on-surface">Workspace Custom URL</label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://taskflow.pro/w/your-domain"
            className="w-full px-md py-sm bg-surface-container-high/40 border border-outline-variant/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 apple-shadow transition-colors"
          />
        </div>
      </form>
    </div>
  );
}
