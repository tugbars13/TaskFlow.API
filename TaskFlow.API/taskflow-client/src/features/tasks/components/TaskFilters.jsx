import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const PRIORITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All" },
  { value: "Personal", label: "Personal" },
  { value: "Work", label: "Work" },
  { value: "Study", label: "Study" },
  { value: "Shopping", label: "Shopping" },
  { value: "Health", label: "Health" },
];


const DUEDATE_OPTIONS = [
  { value: "", label: "All" },
  { value: "Overdue", label: "Overdue" },
  { value: "Today", label: "Today" },
  { value: "ThisWeek", label: "This Week" },
  { value: "NoDueDate", label: "No Due Date" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Backlog", label: "Backlog" },
  { value: "ToDo", label: "To Do" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export default function TaskFilters({ filters, onFilterChange, onClearFilters, assigneeOptions, isTeamBoard }) {
  const [searchTerm, setSearchTerm] = useState(filters.keyword || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.keyword) {
        onFilterChange("keyword", searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.keyword, onFilterChange]);

  const activeFilterCount = Object.keys(filters).filter(k => k !== 'keyword' && filters[k] && (isTeamBoard || k !== 'assigneeId')).length;

  // Fallback if assigneeOptions is not provided
  const safeAssigneeOptions = assigneeOptions || [
    { value: "", label: "All" },
    { value: "Me", label: "Me" },
    { value: "Unassigned", label: "Unassigned" },
  ];

  return (
    <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-3">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 items-center">
        <div className="w-full md:w-64 shrink-0">
          <Input
            icon="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <SelectFilter
            label="Priority"
            value={filters.priority || ""}
            options={PRIORITY_OPTIONS}
            onChange={(val) => onFilterChange("priority", val)}
          />
          <SelectFilter
            label="Category"
            value={filters.category || ""}
            options={CATEGORY_OPTIONS}
            onChange={(val) => onFilterChange("category", val)}
          />
          {isTeamBoard && (
            <SelectFilter
              label="Assignee"
              value={filters.assigneeId || ""}
              options={safeAssigneeOptions}
              onChange={(val) => onFilterChange("assigneeId", val)}
            />
          )}
          <SelectFilter
            label="Due Date"
            value={filters.dueDateRange || ""}
            options={DUEDATE_OPTIONS}
            onChange={(val) => onFilterChange("dueDateRange", val)}
          />
          <SelectFilter
            label="Status"
            value={filters.status || ""}
            options={STATUS_OPTIONS}
            onChange={(val) => onFilterChange("status", val)}
          />
        </div>

        {(activeFilterCount > 0 || searchTerm) && (
          <Button variant="text" size="sm" onClick={() => {
            setSearchTerm("");
            onClearFilters();
          }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/10">
          <span className="text-[11px] text-outline uppercase font-semibold">Active:</span>
          
          {filters.priority && (
            <FilterChip 
              label={`Priority: ${PRIORITY_OPTIONS.find(o => o.value === filters.priority)?.label}`} 
              onRemove={() => onFilterChange("priority", "")} 
            />
          )}
          {filters.category && (
            <FilterChip 
              label={`Category: ${CATEGORY_OPTIONS.find(o => o.value === filters.category)?.label}`} 
              onRemove={() => onFilterChange("category", "")} 
            />
          )}
          {isTeamBoard && filters.assigneeId && (
            <FilterChip 
              label={`Assignee: ${safeAssigneeOptions.find(o => o.value === filters.assigneeId)?.label || filters.assigneeId}`} 
              onRemove={() => onFilterChange("assigneeId", "")} 
            />
          )}
          {filters.dueDateRange && (
            <FilterChip 
              label={`Due Date: ${DUEDATE_OPTIONS.find(o => o.value === filters.dueDateRange)?.label}`} 
              onRemove={() => onFilterChange("dueDateRange", "")} 
            />
          )}
          {filters.status && (
            <FilterChip 
              label={`Status: ${STATUS_OPTIONS.find(o => o.value === filters.status)?.label}`} 
              onRemove={() => onFilterChange("status", "")} 
            />
          )}
        </div>
      )}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-surface-container hover:bg-surface-container-high transition-colors px-2 py-1.5 rounded-lg border border-outline-variant/20">
      <span className="text-[10px] font-semibold text-outline uppercase">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-on-surface text-[12px] font-medium border-none focus:ring-0 cursor-pointer min-w-[70px] outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium border border-primary/20">
      {label}
      <button 
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
}
