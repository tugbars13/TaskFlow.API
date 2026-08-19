import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routesConstants";
import { DEFAULT_USER } from "@/constants/userConstants";
import { cn } from "@/utils/cn";
export default function Navbar({
  user = DEFAULT_USER,
  onSearch,
  onOpenNotifications,
  unreadCount = 0,
  onOpenHelp,
  onLogout,
  isSidebarCollapsed,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header
      id="topbar"
      className={cn(
        "sticky top-0 right-0 z-40",
        "flex items-center justify-between",
        "h-[72px]",
        isSidebarCollapsed ? "w-[calc(100%-80px)] ml-[80px]" : "w-[calc(100%-300px)] ml-[300px]",
        "px-lg",
        "border-b border-outline-variant/20",
        "bg-surface-glass backdrop-blur-md",
        "shadow-sm transition-all duration-300",
      )}
    >
      {/* Search */}
      <div className="flex-1"></div>

      {/* Actions */}
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="text-on-surface hover:text-primary transition-colors relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="Open profile menu"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-surface-variant/50 p-1 pr-2 rounded-full transition-colors cursor-pointer ml-1"
            >
              <div className="size-9 rounded-full overflow-hidden bg-surface-variant ring-1 ring-outline-variant/30">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-on-surface">{user.name}</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-md py-2 z-50">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(ROUTES.SETTINGS);
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </button>
                <div className="h-px bg-gray-200 my-1 mx-2" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 flex items-center gap-2 transition-colors font-medium"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
