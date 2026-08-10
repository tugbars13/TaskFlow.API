import { cn } from "@/utils/cn";
export default function AuthDivider({ text = "or", className }) {
  return (
    <div className={cn("relative flex items-center py-md", className)}>
      <div className="flex-grow border-t border-border-subtle" />

      <span className="mx-md text-label-sm text-on-surface-variant">
        {text}
      </span>

      <div className="flex-grow border-t border-border-subtle" />
    </div>
  );
}
