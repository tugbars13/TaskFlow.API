import Modal from "@/components/ui/Modal";
import TaskDetailsView from "./TaskDetailsView";
import TaskFooter from "./TaskFooter";

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onToggleStatus,
  onDeleteTask,
  isReadOnly = false,
}) {
  if (!isOpen || !task) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <TaskDetailsView task={task} />

      <TaskFooter
        task={task}
        onToggleStatus={onToggleStatus}
        onDeleteTask={onDeleteTask}
        onClose={onClose}
        isReadOnly={isReadOnly}
      />
    </Modal>
  );
}
