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
    <div className="bg-surface-container-lowest py-2 px-3 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-1 max-w-[300px]">
          <Input
            icon="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Status Filters */}
        <div className="hidden md:flex items-center gap-1 border-l border-outline-variant/10 pl-3">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-transparent text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-outline uppercase">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={handlePriorityChange}
              className="bg-transparent text-on-surface text-[11px] font-medium py-1 px-2 border-none focus:ring-0 cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <span className="text-[10px] font-semibold text-outline uppercase">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-on-surface text-[11px] font-medium py-1 px-2 border-none focus:ring-0 cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
        {/* Mobile Status Dropdown (Fallback) */}
        <div className="md:hidden flex items-center gap-1 border-l border-outline-variant/10 pl-3">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-on-surface text-[11px] font-medium py-1 px-2 border-none focus:ring-0 cursor-pointer"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
        </div>
      </div>
    </div>
  );
}
