export default function normalizeStatus(status, isCompleted) {
  if (isCompleted) return "completed";

  if (typeof status === "number") {
    if (status === 4) return "completed";
    if (status === 3) return "in_progress";
    if (status === 2) return "todo";
    return "backlog";
  }

  const s = String(status ?? "")
    .toLowerCase()
    .replace(/[_\s]/g, "");
  if (s === "completed" || s === "4") return "completed";
  if (s === "inprogress" || s === "3") return "in_progress";
  if (s === "todo" || s === "2") return "todo";

  return "backlog";
}
