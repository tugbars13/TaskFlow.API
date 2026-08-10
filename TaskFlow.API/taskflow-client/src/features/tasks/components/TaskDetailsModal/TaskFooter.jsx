import Button from "@/components/ui/Button";

export default function TaskFooter({
  task,
  onToggleStatus,
  onDeleteTask,
  onClose,
  isReadOnly = false,
}) {
  const shouldHideFooter = isReadOnly || (!onToggleStatus && !onDeleteTask);

  if (shouldHideFooter) {
    return null;
  }

  const executeAction = (action) => {
    action?.(task.id);
    onClose?.();
  };

  const handleToggle = () => executeAction(onToggleStatus);

  const handleDelete = () => executeAction(onDeleteTask);

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
