import { useState, useCallback } from "react";
import TaskCard from "./TaskCard";
const DRAG_TASK_KEY = "taskId";
export default function KanbanColumn({
  title,
  count,
  statusId,
  tasks = [],
  color = "bg-primary/10 text-primary",
  onTaskClick,
  onAddTask,
  onDropTask,
  canEditTask = () => true,
  isTeamBoard = true,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (!isDragOver) {
        setIsDragOver(true);
      }
    },
    [isDragOver],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);

      const taskIdStr = event.dataTransfer.getData(DRAG_TASK_KEY);

      if (taskIdStr) {
        onDropTask?.(Number(taskIdStr), statusId);
      }
    },
    [onDropTask, statusId],
  );

  const handleDragStart = useCallback((event, taskId) => {
    event.dataTransfer.setData(DRAG_TASK_KEY, String(taskId));
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full min-h-[600px] bg-surface-container-low/40 border rounded-2xl p-lg apple-shadow transition-all duration-200 ${
        isDragOver
          ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 scale-[1.01]"
          : "border-outline-variant/10"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-lg border-b border-outline-variant/10 mb-lg">
        <div className="flex items-center gap-xs">
          <span className={`w-3 h-3 rounded-full ${color.split(" ")[0]}`} />
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            {title}
          </h3>
          <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-md py-0.5 rounded-full ml-xs">
            {count}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask?.(statusId)}
          aria-label={`Add task to ${title}`}
          className="text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>

      {/* Task Cards List — Dashboard Design System Alignment */}
      <div className="flex-1 space-y-md overflow-y-auto pr-xs">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            draggable={canEditTask(task)}
            onDragStart={(e) => handleDragStart(e, task.id)}
            onClick={() => onTaskClick?.(task)}
            showAssignee={isTeamBoard}
            showTeam={!isTeamBoard}
          />
        ))}
      </div>
    </div>
  );
}
