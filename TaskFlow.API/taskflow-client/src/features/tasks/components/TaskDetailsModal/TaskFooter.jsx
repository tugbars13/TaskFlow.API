import Button from "@/components/ui/Button";

export default function TaskFooter({
  task,
  onToggleStatus,
  onDeleteTask,
  onClose,
  isReadOnly = false,
}) {
  if (isReadOnly || (!onToggleStatus && !onDeleteTask)) return null;

  const handleToggle = () => {
    onToggleStatus?.(task.id);
    onClose?.();
  };

  const handleDelete = () => {
    onDeleteTask?.(task.id);
    onClose?.();
  };

  return (
    <div className="flex items-center justify-end gap-sm pt-lg mt-lg border-t border-outline-variant/10">
      {onDeleteTask && (
        <Button
          variant="text"
          onClick={handleDelete}
          className="text-error hover:text-error"
        >
          Delete
        </Button>
      )}

      {onToggleStatus && (
        <Button variant="filled" onClick={handleToggle}>
          {task.isCompleted ? "Mark as In Progress" : "Mark as Completed"}
        </Button>
      )}
    </div>
  );
}
