import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DatePickerInput from "@/components/ui/DatePickerInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getTeamMembers } from "@/features/teams/api/teamService";

const DEFAULT_FORM_VALUES = Object.freeze({
  title: "",
  description: "",
  priority: "Medium",
  category: "General",
  dueDate: "",
  assigneeIds: [],
});

const DEFAULT_CATEGORIES = [
  "General",
  "Design System",
  "Backend",
  "Frontend",
  "Marketing",
  "QA",
  "Team Sync",
];

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  teamId = null,
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
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
      fetchAssignees();
    }
  }, [isOpen, teamId]);

  const fetchAssignees = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const members = await getTeamMembers(teamId);
      console.log("Team members response from getTeamMembers:", members);
      setTeamMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      console.warn("Failed to load assignees from Users API:", err);
      setTeamMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [teamId]);

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
        category: initialData?.category || "General",
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
  if (!formData.category) errors.category = "Category is required.";
  if (!formData.dueDate) errors.dueDate = "Due date is required.";

  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, priority: true, category: true, dueDate: true });

    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate,
        assigneeIds: formData.assigneeIds.map(Number),
      };

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
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🔵 Low Priority</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              onBlur={() => handleBlur("category")}
              disabled={submitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            isSelected
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
