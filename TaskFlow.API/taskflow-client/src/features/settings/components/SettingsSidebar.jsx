const SETTINGS_SECTIONS = Object.freeze([
  { id: "Profile", label: "Profile", icon: "person" },
  { id: "Account", label: "Account", icon: "manage_accounts" },
  { id: "Notifications", label: "Notifications", icon: "notifications" },
  { id: "Security", label: "Security", icon: "security" },
  { id: "Workspace", label: "Workspace", icon: "workspaces" },
  { id: "Billing", label: "Billing", icon: "credit_card" },
]);
export default function SettingsSidebar({ activeSection, onSelectSection }) {
  return (
    <div className="bg-surface rounded-2xl p-md border border-outline-variant/10 apple-shadow space-y-xs">
      <p className="text-xs font-semibold text-outline uppercase tracking-wider px-md py-xs">
        Preferences
      </p>
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection?.(section.id)}
            aria-label={isActive ? "page" : undefined}
            className={`w-full flex items-center gap-md px-md py-sm rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {section.icon}
            </span>
            {section.label}
          </button>
        );
      })}
    </div>
  );
}
