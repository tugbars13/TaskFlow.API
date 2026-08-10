import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
const STATUS_OPTIONS = Object.freeze(["All", "Active", "Completed"]);

const PRIORITY_OPTIONS = Object.freeze([
  { value: "All", label: "All Priorities" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
]);

const SORT_OPTIONS = Object.freeze([
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title A-Z" },
]);
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
  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
  };

  const handlePriorityChange = (event) => {
    onPriorityChange(event.target.value);
  };

  const handleSortChange = (event) => {
    onSortChange(event.target.value);
  };
  return (
    <div className="space-y-md bg-surface-container-lowest p-md md:p-lg rounded-2xl apple-shadow border border-outline-variant/10">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-md">
        <div className="flex-1 max-w-md">
          <Input
            icon="search"
            placeholder="Search tasks by title or category..."
            value={searchQuery}
            onChange={handleSearchChange}
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
          <span className="text-xs font-semibold text-outline uppercase tracking-wider">
            Status:
          </span>
          {STATUS_OPTIONS.map((status) => (
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
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={handlePriorityChange}
              className="bg-surface-container-high/60 text-on-surface text-xs font-medium py-xs px-md rounded-xl border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-xs">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-surface-container-high/60 text-on-surface text-xs font-medium py-xs px-md rounded-xl border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
