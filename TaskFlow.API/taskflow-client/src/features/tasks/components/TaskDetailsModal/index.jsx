import { useState } from "react";
import Modal from "@/components/ui/Modal";
import TaskDetailsView from "./TaskDetailsView";
import TaskFooter from "./TaskFooter";
import TaskBreakdownModal from "../TaskBreakdownModal";
import useTasks from "../../hooks/useTasks";

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onToggleStatus,
  onDeleteTask,
  isReadOnly = false,
}) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  
  // Safe use of context - TasksPage provides it, CalendarPage might not if not wrapped,
  // but CalendarPage does use TasksProvider at the root. We can use it safely.
  let addTask;
  try {
    const context = useTasks();
    addTask = context.addTask;
  } catch (e) {
    // Fallback if used outside provider, though app wraps it in main pages
    console.warn("useTasks must be used within TasksProvider");
  }

  if (!isOpen || !task) {
    return null;
  }

  const handleAddSubtasks = async (subtasks) => {
    if (!addTask) return;
    
    // Create each subtask
    for (const st of subtasks) {
      await addTask({
        title: st.title,
        description: st.description,
        category: task.category,
        priority: task.priority,
        dueDate: null,
        parentTaskId: task.id,
        teamId: task.teamId
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !isBreakdownOpen} onClose={onClose} title={task.title}>
        <TaskDetailsView task={task} />

        <TaskFooter
          task={task}
          onToggleStatus={onToggleStatus}
          onDeleteTask={onDeleteTask}
          onBreakdown={() => setIsBreakdownOpen(true)}
          onClose={onClose}
          isReadOnly={isReadOnly}
        />
      </Modal>

      <TaskBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        task={task}
        onAddSubtasks={handleAddSubtasks}
      />
    </>
  );
}
