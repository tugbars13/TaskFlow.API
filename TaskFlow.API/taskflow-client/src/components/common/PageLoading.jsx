import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export default function PageLoading({
  message = "Loading...",
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-2xl min-h-[400px] rounded-3xl bg-surface-container-lowest border border-outline-variant/10 apple-shadow",
        className
      )}
    >
      <Spinner size="lg" ariaLabel={message} />

      <p className="mt-md text-body-sm text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}