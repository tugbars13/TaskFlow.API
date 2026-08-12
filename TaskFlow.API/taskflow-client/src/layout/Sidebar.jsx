import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routesConstants";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "dashboard" },
  { path: ROUTES.TASKS, label: "Tasks", icon: "task_alt" },
  { path: ROUTES.CALENDAR, label: "Calendar", icon: "calendar_today" },
  { path: ROUTES.ANALYTICS, label: "Analytics", icon: "analytics" },
  { path: ROUTES.TEAM, label: "Team", icon: "group" },
  { path: ROUTES.SETTINGS, label: "Settings", icon: "settings" },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-50",
        "flex flex-col justify-between",
        isCollapsed ? "w-[80px]" : "w-[300px]",
        "bg-[var(--color-sidebar)]",
        "border-r border-[var(--color-sidebar-border)]",
        "transition-all duration-300",
      )}
    >
      <div className={cn("flex flex-col w-full h-full")}>
        {/* Brand Header */}
        <div className="relative flex flex-col items-center w-full shrink-0 pt-4 pb-2">
          {/* Collapse Toggle Button */}
          <div
            className={cn(
              "w-full flex",
              isCollapsed ? "justify-center" : "justify-end px-3",
            )}
          >
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center justify-center size-8 rounded-full text-[var(--color-sidebar-text-variant)] hover:text-primary hover:bg-[var(--color-sidebar-hover)] transition-colors shrink-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isCollapsed
                  ? "keyboard_double_arrow_right"
                  : "keyboard_double_arrow_left"}
              </span>
            </button>
          </div>

          {/* Logo Area */}
          <div
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 w-full",
              isCollapsed ? "mt-4" : "mt-2",
            )}
          >
            <img
              src="/taskflow-logo-symbol.png"
              alt="TaskFlow Pro Logo Symbol"
              className={cn(
                "object-contain transition-all duration-300",
                isCollapsed ? "h-[40px] w-auto" : "h-[90px] w-auto",
              )}
            />

            {!isCollapsed && (
              <div className="flex flex-col items-center text-center w-full mt-4">
                <span className="font-bold text-[18px] tracking-[0.18em] text-gray-900 uppercase leading-none">
                  TaskFlow
                </span>
                <span className="font-medium text-[11px] tracking-[0.16em] text-gray-500 uppercase mt-2">
                  Tübitak Destekli
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            isCollapsed ? "px-2 space-y-2 mt-4" : "px-[14px] space-y-1 mt-6",
          )}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 h-[46px]",
                  isCollapsed
                    ? "justify-center w-full"
                    : "px-[14px] gap-[14px] text-[14px] font-semibold",
                  isActive
                    ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] shadow-xs"
                    : "text-[var(--color-sidebar-text-variant)] hover:bg-[var(--color-sidebar-hover)] hover:text-primary",
                )}
              >
                <span
                  className="material-symbols-outlined text-[22px] shrink-0"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Footer Badge */}
        <div
          className={cn(
            "shrink-0 transition-all duration-300",
            isCollapsed ? "px-2 pb-6 pt-4" : "p-[14px]",
          )}
        >
          <div
            className={cn(
              "rounded-2xl bg-surface-container-low border border-[var(--color-sidebar-border)] flex items-center transition-all duration-300 overflow-hidden cursor-pointer hover:bg-[var(--color-sidebar-hover)]",
              isCollapsed
                ? "flex-col p-2 gap-2"
                : "p-[14px] gap-[14px] w-full justify-between",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "flex-col gap-2" : "gap-[14px]",
              )}
            >
              <div className="size-[40px] rounded-full bg-surface-container-high border border-[var(--color-sidebar-border)] text-[var(--color-sidebar-text-variant)] flex items-center justify-center font-bold text-sm shrink-0">
                WS
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <p className="font-label-md text-[14px] font-bold text-[var(--color-sidebar-text)] truncate leading-tight">
                    My Workspace
                  </p>
                  <p className="text-[12px] text-[var(--color-sidebar-text-variant)] font-medium truncate mt-0.5">
                    Pro Plan
                  </p>
                </div>
              )}
            </div>
            <span className="material-symbols-outlined text-[18px] text-[var(--color-sidebar-text-variant)] shrink-0">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
