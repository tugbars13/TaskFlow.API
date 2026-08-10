import { cn } from "@/utils/cn";

const BASE_CLASSES = "rounded-full px-sm py-0.5 text-xs font-label-md";

export default function Badge({ children, className = "" }) {
  return <span className={cn(BASE_CLASSES, className)}>{children}</span>;
}
