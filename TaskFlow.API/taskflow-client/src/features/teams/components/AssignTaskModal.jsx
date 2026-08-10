import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DatePickerInput from "@/components/ui/DatePickerInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { TASK_CATEGORIES } from "@/features/tasks/constants/category.constants";
import { TASK_PRIORITY } from "@/features/tasks/constants/priority.constants";

export default function AssignTaskModal({ isOpen, onClose, memberName, onAssignTask }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM);
  const [category, setCategory] = useState(TASK_CATEGORIES[0]);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTaskTitle("");
      setPriority(TASK_PRIORITY.MEDIUM);
      setCategory(TASK_CATEGORIES[0]);
      setDueDate("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAssignTask?.({
        title: taskTitle.trim(),
        priority,
        category,
        dueDate,
        assignee: memberName,
      });
      onClose();
    } catch (error) {
      console.error("Failed to assign task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Task to ${memberName || "Member"}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-lg">
        <Input
          label="Task Title *"
          placeholder="e.g. Implement API Endpoint"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {Object.values(TASK_PRIORITY).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DatePickerInput
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!taskTitle.trim() || isSubmitting}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Assigning...
              </span>
            ) : (
              "Assign Task"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
