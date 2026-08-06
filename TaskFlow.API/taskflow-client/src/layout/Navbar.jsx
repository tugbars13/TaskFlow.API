import { DEFAULT_USER } from "@/constants/user.constants";
import { cn } from "@/utils/cn";
export default function Navbar({
  user = DEFAULT_USER,
  onSearch,
  onOpenAssistant,
  onOpenNotifications,
  onOpenHelp,
  onOpenProfile
}) {
  return (
    <header
      id="topbar"
      className={cn(
        "sticky top-0 right-0 z-40",
        "flex items-center justify-between",
        "h-[72px]",
        "w-[calc(100%-var(--spacing-sidebar-width))]",
        "ml-sidebar-width",
        "px-lg",
        "border-b border-outline-variant/20",
        "bg-surface-glass backdrop-blur-md",
        "shadow-sm transition-all duration-300"
      )} >
      {/* Search */}
      <div className="flex items-center gap-md flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            aria-label="Search"
            placeholder="Search tasks, docs, or colleagues..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full bg-surface-container-high/50 border-none rounded-full pl-xl pr-md py-sm focus:ring-0 text-body-md"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-lg">
        <button
          type="button"
          onClick={onOpenAssistant}
          className="text-primary font-label-md flex items-center gap-xs hover:bg-primary/5 px-md py-sm rounded-full transition-all"
        >
          <span className="material-symbols-outlined">smart_toy</span>
          AI Assistant
        </button>

        <div className="flex items-center gap-md border-l border-outline-variant/30 pl-lg">
          <button
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button
            type="button"
            aria-label="Help"
            onClick={onOpenHelp}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">help</span>
          </button>

          <button
            type="button"
            aria-label="Open profile menu"
            onClick={onOpenProfile}
            className="size-10 rounded-full overflow-hidden bg-surface-variant cursor-pointer ring-2 ring-primary/10"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="size-10 object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
