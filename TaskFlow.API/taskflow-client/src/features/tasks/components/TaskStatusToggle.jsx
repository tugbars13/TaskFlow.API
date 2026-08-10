export default function TaskStatusToggle({ completed = false, onToggle }) {
  const buttonClassName = completed
    ? "bg-primary border-primary text-on-primary"
    : "border-primary/20 text-primary hover:bg-primary hover:text-on-primary";
  const icon = completed ? "check_circle" : "radio_button_unchecked";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={completed}
      aria-label={
        completed ? "Mark task as incomplete" : "Mark task as completed"
      }
      className={`
  w-12 h-12
  rounded-full
  border-2
  flex
  items-center
  justify-center
  transition-all
  duration-300
  ${buttonClassName}
`}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
