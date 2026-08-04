export default function TaskStatusToggle({
  completed = false,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-12 h-12
        rounded-full
        border-2
        flex
        items-center
        justify-center
        transition-all
        duration-300

        ${
          completed
            ? "bg-primary border-primary text-on-primary"
            : "border-primary/20 text-primary hover:bg-primary hover:text-on-primary"
        }
      `}
    >
      <span className="material-symbols-outlined">
        {completed ? "check_circle" : "radio_button_unchecked"}
      </span>
    </button>
  );
}