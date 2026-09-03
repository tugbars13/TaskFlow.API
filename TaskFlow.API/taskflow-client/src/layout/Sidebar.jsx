import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routesConstants";
import { cn } from "@/utils/cn";

const WORKSPACE_CHILDREN = [
  { path: ROUTES.OVERVIEW, label: "Overview", icon: "space_dashboard" },
  { path: ROUTES.TASKS, label: "Tasks", icon: "task_alt" },
  { path: ROUTES.CALENDAR, label: "Calendar", icon: "calendar_today" },
  { path: ROUTES.ANALYTICS, label: "Analytics", icon: "analytics" },
  { path: ROUTES.TEAM, label: "Team", icon: "group" },
];

// exact: true → only active when path matches exactly
// startsWith: override prefix for active detection (Klasörler is active on /myspace/folder/:id too)
const MY_SPACE_NAV_ITEMS = [
  { path: ROUTES.MY_SPACE, label: "Home", icon: "home", exact: true },
  {
    path: ROUTES.MY_SPACE + "/folders",
    label: "Klasörler",
    icon: "folder_open",
    startsWith: ROUTES.MY_SPACE + "/folder",
  },
  {
    path: ROUTES.MY_SPACE + "/pages",
    label: "Sayfalar",
    icon: "description",
    startsWith: ROUTES.MY_SPACE + "/page/",
  },
];

const TOP_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "dashboard" },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isWorkspaceChildActive = WORKSPACE_CHILDREN.some(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`),
  );
  const isMySpaceChildActive = location.pathname.startsWith(ROUTES.MY_SPACE);

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(
    isWorkspaceChildActive,
  );
  const [isMySpaceOpen, setIsMySpaceOpen] = useState(isMySpaceChildActive);

  const isSimpleActive = (path) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === ROUTES.DASHBOARD;
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Per-item active logic for My Space sub-items
  const isMySpaceItemActive = (item) => {
    if (item.exact) return location.pathname === item.path;

    // Override for pages (to differentiate root page vs folder page)
    if (location.pathname.startsWith(ROUTES.MY_SPACE + "/page/")) {
      const isFolderPage = !!location.state?.folderId;
      if (item.label === "Klasörler") return isFolderPage;
      if (item.label === "Sayfalar") return !isFolderPage;
    }

    if (item.startsWith)
      return (
        location.pathname === item.path ||
        location.pathname.startsWith(item.startsWith)
      );
    return isSimpleActive(item.path);
  };

  // Navigate to /myspace/folders with state so FoldersView can trigger folder creation
  const handleNewFolder = () => {
    navigate(ROUTES.MY_SPACE + "/folders", { state: { createFolder: true } });
  };

  const renderNavLink = (item, isChild = false, activeOverride = undefined) => {
    const active =
      activeOverride !== undefined ? activeOverride : isSimpleActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "flex items-center rounded-xl transition-all duration-200 h-[46px]",
          isCollapsed
            ? "justify-center w-full"
            : cn(
                "px-[14px] gap-[14px] text-[14px] font-semibold",
                isChild && "pl-[42px]",
              ),
          active
            ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] shadow-xs"
            : "text-[var(--color-sidebar-text-variant)] hover:bg-[var(--color-sidebar-hover)] hover:text-primary",
        )}
      >
        <span
          className="material-symbols-outlined text-[22px] shrink-0"
          style={{
            fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {item.icon}
        </span>
        {!isCollapsed && (
          <span className="whitespace-nowrap">{item.label}</span>
        )}
      </Link>
    );
  };

  const renderAccordionHeader = (
    label,
    icon,
    isActive,
    isOpen,
    onToggleOpen,
  ) => (
    <button
      type="button"
      onClick={onToggleOpen}
      className={cn(
        "flex items-center w-full rounded-xl transition-all duration-200 h-[46px]",
        "px-[14px] gap-[14px] text-[14px] font-semibold",
        isActive
          ? "text-primary"
          : "text-[var(--color-sidebar-text-variant)] hover:bg-[var(--color-sidebar-hover)] hover:text-primary",
      )}
    >
      <span
        className="material-symbols-outlined text-[22px] shrink-0"
        style={{
          fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        {icon}
      </span>
      <span className="whitespace-nowrap flex-1 text-left">{label}</span>
      <span
        className="material-symbols-outlined text-[18px] shrink-0 transition-transform duration-200"
        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        expand_more
      </span>
    </button>
  );

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
                  Tübitask
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
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            isCollapsed ? "px-2 space-y-2 mt-4" : "px-[14px] space-y-1 mt-6",
          )}
        >
          {/* Dashboard & Settings */}
          {TOP_ITEMS.map((item) => renderNavLink(item))}

          {/* ── My Workspace ── */}
          {isCollapsed ? (
            WORKSPACE_CHILDREN.map((item) => renderNavLink(item))
          ) : (
            <div>
              {renderAccordionHeader(
                "My Workspace",
                "folder_open",
                isWorkspaceChildActive,
                isWorkspaceOpen,
                () => setIsWorkspaceOpen((prev) => !prev),
              )}
              {isWorkspaceOpen && (
                <div className="space-y-1 mt-1">
                  {WORKSPACE_CHILDREN.map((item) => renderNavLink(item, true))}
                </div>
              )}
            </div>
          )}

          {/* ── My Space ── */}
          {isCollapsed ? (
            <>
              {MY_SPACE_NAV_ITEMS.map((item) =>
                renderNavLink(item, false, isMySpaceItemActive(item)),
              )}
              {/* Yeni Klasör — collapsed icon button */}
              <button
                type="button"
                title="Yeni Klasör"
                onClick={handleNewFolder}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 h-[46px]",
                  "justify-center w-full",
                  "text-[var(--color-sidebar-text-variant)] hover:bg-[var(--color-sidebar-hover)] hover:text-primary",
                )}
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">
                  create_new_folder
                </span>
              </button>
            </>
          ) : (
            <div>
              {renderAccordionHeader(
                "My Space",
                "space_dashboard",
                isMySpaceChildActive,
                isMySpaceOpen,
                () => setIsMySpaceOpen((prev) => !prev),
              )}
              {isMySpaceOpen && (
                <div className="space-y-1 mt-1">
                  {MY_SPACE_NAV_ITEMS.map((item) =>
                    renderNavLink(item, true, isMySpaceItemActive(item)),
                  )}
                  {/* Yeni Klasör — action button, not a route link */}
                  <button
                    type="button"
                    onClick={handleNewFolder}
                    className={cn(
                      "flex items-center w-full rounded-xl transition-all duration-200 h-[46px]",
                      "pl-[42px] px-[14px] gap-[14px] text-[14px] font-semibold",
                      "text-[var(--color-sidebar-text-variant)] hover:bg-[var(--color-sidebar-hover)] hover:text-primary",
                    )}
                  >
                    <span className="material-symbols-outlined text-[22px] shrink-0">
                      create_new_folder
                    </span>
                    <span className="whitespace-nowrap">Yeni Klasör</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Settings at the bottom */}
        <div
          className={cn(
            "shrink-0 py-4 border-t border-[var(--color-sidebar-border)] mt-2",
            isCollapsed ? "px-2" : "px-[14px]"
          )}
        >
          {renderNavLink({ path: ROUTES.SETTINGS, label: "Settings", icon: "settings" })}
        </div>
      </div>
    </aside>
  );
}
