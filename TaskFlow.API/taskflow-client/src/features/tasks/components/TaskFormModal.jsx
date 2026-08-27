import { useState, useEffect, useRef, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DatePickerInput from "@/components/ui/DatePickerInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import useTeam from "@/features/teams/hooks/useTeam";
import { getCategories, createCategory } from "@/features/tasks/api/categoryService";

const DEFAULT_FORM_VALUES = Object.freeze({
  title: "",
  description: "",
  priority: "Medium",
  categoryId: null,
  dueDate: "",
  assigneeIds: [],
});



// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Custom Category Combobox Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// searchQuery (arama) ve value (seÃƒÂ§im) tamamen ayrÃ„Â± state'ler.
function CategoryCombobox({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const trimmed = searchQuery.trim().toLowerCase();

  const filtered = trimmed
    ? categories.filter((cat) => cat.name.toLowerCase().includes(trimmed))
    : categories;

  const exactMatch = categories.some(
    (cat) => cat.name.toLowerCase() === trimmed
  );
  const showCreateOption = trimmed.length > 0 && !exactMatch;

  const handleSelect = (cat) => {
    onChange(cat.id);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    const newCat = searchQuery.trim();
    if (newCat) {
      setIsCreating(true);
      try {
        const created = await createCategory(newCat);
        setCategories((prev) => [...prev, created]);
        onChange(created.id);
        setIsOpen(false);
      } catch (err) {
        console.error("Failed to create category", err);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      } else if (showCreateOption && filtered.length === 0) {
        handleCreateNew();
      }
    }
  };

  const selectedCategory = categories.find(c => c.id === value);
  const displayValue = selectedCategory ? selectedCategory.name : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled || isCreating}
        onClick={() => setIsOpen((o) => !o)}
        className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex items-center justify-between text-left gap-2"
      >
        <span className={displayValue ? "text-on-surface truncate" : "text-outline/60"}>
          {displayValue || "Kategori seÃ§..."}
        </span>
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 transition-transform duration-150 ${
            isOpen ? "text-primary rotate-180" : "text-outline/50"
          }`}
        >
          {isCreating ? "hourglass_empty" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: "var(--color-surface, #fff)",
            border: "1px solid color-mix(in srgb, currentColor 10%, transparent)",
            maxHeight: "300px",
          }}
        >
          <div className="px-2 pt-2 pb-1.5 shrink-0">
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 select-none pointer-events-none text-outline/40"
                style={{ fontSize: "15px", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                search
              </span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Ara..."
                className="w-full rounded-xl py-1.5 pl-8 pr-3 text-on-surface placeholder:text-outline/40 border-none outline-none"
                style={{
                  fontSize: "13px",
                  background: "color-mix(in srgb, currentColor 5%, transparent)",
                }}
              />
            </div>
          </div>

          <div
            className="shrink-0 mx-2"
            style={{ height: "1px", background: "color-mix(in srgb, currentColor 8%, transparent)" }}
          />

          {filtered.length > 0 && (
            <div
              className="overflow-y-auto py-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor:
                  "color-mix(in srgb, currentColor 20%, transparent) transparent",
              }}
            >
              {filtered.map((cat) => {
                const isSelected = value === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(cat)}
                    className="w-full text-left flex items-center gap-2 transition-colors duration-100"
                    style={{
                      padding: "6px 14px",
                      fontSize: "13px",
                      fontWeight: isSelected ? 500 : 400,
                      color: isSelected
                        ? "var(--color-primary, #6750A4)"
                        : "var(--color-on-surface, #1C1B1F)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "color-mix(in srgb, currentColor 5%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{
                        fontSize: "15px",
                        fontVariationSettings: "'FILL' 1, 'wght' 600",
                        opacity: isSelected ? 1 : 0,
                        color: "var(--color-primary, #6750A4)",
                        width: "15px",
                      }}
                    >
                      check
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {showCreateOption && (
            <div className="shrink-0 p-1.5 bg-surface-container-low border-t border-outline/10">
              <button
                type="button"
                onClick={handleCreateNew}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isCreating}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-left transition-colors duration-100 text-primary hover:bg-primary/10"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: "16px" }}
                >
                  {isCreating ? "hourglass_empty" : "add_circle"}
                </span>
                <span className="truncate text-on-surface">
                  <strong className="text-primary font-semibold">
                    "{searchQuery.trim()}"
                  </strong>{" "}
                  kategorisini oluÅŸtur
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  teamId = null,
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const { members: allMembers, loading: loadingMembers } = useTeam();

  const teamMembers = useMemo(() => {
    if (!allMembers || !teamId) return [];
    return allMembers.filter((m) => Number(m.teamId) === Number(teamId));
  }, [allMembers, teamId]);

  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSubmitting(false);
      setTouched({});

      let initialAssigneeIds = [];
      if (initialData?.assignees && initialData.assignees.length > 0) {
        initialAssigneeIds = initialData.assignees.map((a) => String(a.id));
      } else if (initialData?.assignedUserId) {
        initialAssigneeIds = [String(initialData.assignedUserId)];
      }

      setFormData({
        title: initialData?.title || "",
        description: initialData?.description || "",
        priority: initialData?.priority || "Medium",
        categoryId: initialData?.categoryId || null,
        dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : "",
        assigneeIds: initialAssigneeIds,
      });
    }
  }, [initialData, isOpen]);

  // Validation rules
  const errors = {};
  if (!formData.title.trim()) {
    errors.title = "Task title is required.";
  } else if (formData.title.trim().length < 3) {
    errors.title = "Task title must be at least 3 characters.";
  }

  if (!formData.priority) errors.priority = "Priority is required.";
  if (!formData.categoryId) errors.categoryId = "Category is required.";
  if (!formData.dueDate) errors.dueDate = "Due date is required.";

  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setTouched({ title: true, priority: true, categoryId: true, dueDate: true });

    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
          title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        categoryId: formData.categoryId,
        dueDate: formData.dueDate,
        assigneeIds: formData.assigneeIds.map(Number),
      };

      console.log("CREATE TASK PAYLOAD:", JSON.stringify(payload, null, 2));
        await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Task submission failed:", err);
      setSubmitError(
        err.message || "Failed to create task. Please check server connection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disableClose={submitting}
      title={initialData && initialData.id ? "Edit Task" : "Create New Task"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-lg">
        {submitError && (
          <div className="p-md bg-error-container/20 border border-error/30 rounded-2xl text-error text-xs font-semibold flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {submitError}
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-xs">
          <Input
            label="Task Name *"
            placeholder="e.g. Finalize Q3 Roadmap & Design Tokens"
            value={formData.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            disabled={submitting}
          />
          {touched.title && errors.title && (
            <p className="text-xs text-error font-medium pl-sm">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-xs">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            Task Description
          </label>
          <textarea
            rows={3}
            placeholder="Add detailed task description, acceptance criteria, or requirements..."
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            disabled={submitting}
            className="w-full bg-surface-container-high/50 border-none rounded-2xl p-md text-body-md font-body-md text-on-surface placeholder:text-outline/60 apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Two-Column Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Priority */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleFieldChange("priority", e.target.value)}
              onBlur={() => handleBlur("priority")}
              disabled={submitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="High">ğŸ”´ High Priority</option>
              <option value="Medium">ğŸŸ¡ Medium Priority</option>
              <option value="Low">ğŸŸ¢ Low Priority</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Category *
            </label>
            <CategoryCombobox
              value={formData.categoryId}
              onChange={(val) => handleFieldChange("categoryId", val)}
              disabled={submitting}
            />
            {touched.categoryId && errors.categoryId && (
              <p className="text-xs text-error font-medium pl-sm">
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Deadline / Due Date */}
          <DatePickerInput
            label="Deadline (Due Date) *"
            value={formData.dueDate}
            onChange={(e) => handleFieldChange("dueDate", e.target.value)}
            onBlur={() => handleBlur("dueDate")}
            disabled={submitting}
            error={touched.dueDate ? errors.dueDate : null}
          />

          {/* Assignees (Multi-Select) */}
          {teamId && (
            <div className="space-y-xs md:col-span-2" ref={dropdownRef}>
              <label className="block font-label-md text-label-md font-semibold text-on-surface">
                Assigned Users (Optional)
              </label>
              <div className="relative">
                <div
                  className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer flex justify-between items-center"
                  onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                >
                  <span className={formData.assigneeIds.length === 0 ? "text-outline/60" : "text-on-surface"}>
                    {formData.assigneeIds.length === 0
                      ? "Select users..."
                      : `${formData.assigneeIds.length} user(s) selected`}
                  </span>
                  <span className="material-symbols-outlined text-outline/60">
                    {isAssigneeDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </div>

                {isAssigneeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-surface rounded-2xl shadow-lg border border-outline/20 max-h-60 overflow-y-auto p-2">
                    {teamMembers
                      .filter(
                        (v, i, a) =>
                          a.findIndex((t) => t.userId === v.userId) === i &&
                          (v.status === "Active" || v.status === "Accepted" || v.status === 1) // Backend maps accepted members to "Active"
                      )
                      .map((member) => {
                        const isSelected = formData.assigneeIds.includes(
                          String(member.userId)
                        );
                        return (
                          <label
                            key={member.id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-surface-container-high text-on-surface"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const idStr = String(member.userId);
                                setFormData((prev) => {
                                  const newIds = e.target.checked
                                    ? [...prev.assigneeIds, idStr]
                                    : prev.assigneeIds.filter((id) => id !== idStr);
                                  return { ...prev, assigneeIds: newIds };
                                });
                              }}
                              disabled={submitting || loadingMembers}
                              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-body-sm font-medium">
                              {member.fullName || member.name}
                            </span>
                          </label>
                        );
                      })}
                    {teamMembers.filter(
                      (v, i, a) =>
                        a.findIndex((t) => t.userId === v.userId) === i &&
                        (v.status === "Active" || v.status === "Accepted" || v.status === 1)
                    ).length === 0 && !loadingMembers && (
                        <div className="text-center text-body-sm text-outline p-4">
                          No accepted team members available.
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={submitting || (touched.title && !isFormValid)}
            className="px-xl py-md rounded-2xl font-semibold shadow-md active:scale-95 transition-all"
          >
            {submitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Saving...
              </span>
            ) : initialData && initialData.id ? (
              "Save Changes"
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}



