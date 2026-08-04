import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "dashboard" },
  { path: ROUTES.TASKS, label: "Tasks", icon: "task_alt" },
  { path: ROUTES.CALENDAR, label: "Calendar", icon: "calendar_today" },
  { path: ROUTES.ANALYTICS, label: "Analytics", icon: "analytics" },
  { path: ROUTES.TEAM, label: "Team", icon: "group" },
  { path: ROUTES.SETTINGS, label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[var(--spacing-sidebar-width)] bg-surface border-r border-outline-variant/20 flex flex-col justify-between p-lg z-50 transition-all duration-300">
      <div className="space-y-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-sm px-xs">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-md shadow-md">
            TF
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            TaskFlow Pro
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-md px-md py-sm rounded-xl text-body-md font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Workspace Footer Badge */}
      <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center gap-md">
        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold text-xs">
          WS
        </div>
        <div className="min-w-0">
          <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
            My Workspace
          </p>
          <p className="text-xs text-on-surface-variant/70 truncate">Pro Plan</p>
        </div>
      </div>
    </aside>
  );
}
