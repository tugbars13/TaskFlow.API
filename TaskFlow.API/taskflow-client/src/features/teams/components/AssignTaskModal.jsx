import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DatePickerInput from "@/components/ui/DatePickerInput";
import Button from "@/components/ui/Button";

export default function AssignTaskModal({ isOpen, onClose, memberName, onAssignTask }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAssignTask?.({
      title: taskTitle.trim(),
      priority,
      category,
      dueDate,
      assignee: memberName,
    });

    setTaskTitle("");
    setDueDate("");
    onClose();
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
        />

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Design System">Design System</option>
              <option value="Marketing">Marketing</option>
              <option value="QA">QA</option>
            </select>
          </div>
        </div>

        <DatePickerInput
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!taskTitle.trim()}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md"
          >
            Assign Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
