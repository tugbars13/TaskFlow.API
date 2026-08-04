import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  onNewTaskClick,
}) {
  return (
    <div className="space-y-md bg-surface-container-lowest p-md md:p-lg rounded-2xl apple-shadow border border-outline-variant/10">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-md">
        <div className="flex-1 max-w-md">
          <Input
            icon="search"
            placeholder="Search tasks by title or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button
          variant="filled"
          onClick={onNewTaskClick}
          className="flex items-center justify-center gap-xs px-lg py-md rounded-2xl shadow-md active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-md pt-sm border-t border-outline-variant/10">
        <div className="flex items-center gap-sm flex-wrap">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">Status:</span>
          {["All", "Active", "Completed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`px-md py-xs rounded-full text-xs font-label-md transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-md flex-wrap">
          <div className="flex items-center gap-xs">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="bg-surface-container-high/60 text-on-surface text-xs font-medium py-xs px-md rounded-xl border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-xs">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-surface-container-high/60 text-on-surface text-xs font-medium py-xs px-md rounded-xl border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
