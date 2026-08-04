import { cn } from "@/utils/cn";

export default function PageContainer({
  children,
  className = "",
}) {
  return (
    <div
      className={cn(
        "space-y-xl pb-xl transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}