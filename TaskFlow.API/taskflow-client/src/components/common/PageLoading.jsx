import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export default function PageLoading({
  message = "Loading...",
  className = "",
}) {
  return (
    <div
      className={cn(
          "flex flex-col items-center justify-center",
          "min-h-page-loading py-2xl",
          "rounded-3xl border border-outline-variant/10",
          "bg-surface-container-lowest apple-shadow",
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