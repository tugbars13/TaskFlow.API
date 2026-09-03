const PRIORITY_BORDER = Object.freeze({
  high: "border-l-[4px] border-l-rose-500 dark:border-l-rose-400",
  3: "border-l-[4px] border-l-rose-500 dark:border-l-rose-400",

  medium: "border-l-[4px] border-l-amber-500 dark:border-l-amber-400",
  2: "border-l-[4px] border-l-amber-500 dark:border-l-amber-400",

  low: "border-l-[4px] border-l-sky-500 dark:border-l-sky-400",
  1: "border-l-[4px] border-l-sky-500 dark:border-l-sky-400",
});
export function getPriorityBorderClass(priority) {
  return (
    PRIORITY_BORDER[String(priority ?? "").toLowerCase()] ??
    PRIORITY_BORDER.medium
  );
}
