export function getPriorityBorderClass(priority) {
  switch (priority?.toLowerCase()) {
    case "high":
    case "3":
      return "border-l-[4px] border-l-rose-500 dark:border-l-rose-400";

    case "low":
    case "1":
      return "border-l-[4px] border-l-sky-500 dark:border-l-sky-400";

    case "medium":
    case "2":
    default:
      return "border-l-[4px] border-l-amber-500 dark:border-l-amber-400";
  }
}