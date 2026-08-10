import { useEffect } from "react";
import Card from "./Card";
import { cn } from "@/utils/cn";
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md:max-w-[560px]",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
    >
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <Card
        className={cn(
          "relative z-10 w-[calc(100vw-32px)] sm:w-[90vw] md:w-[560px] max-w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl border border-outline-variant/20 rounded-3xl p-lg animate-scale-up shrink-0 my-auto",
          maxWidth,
        )}
      >
        <div className="flex items-center justify-between pb-md border-b border-outline-variant/10 mb-lg w-full">
          <h3
            id="modal-title"
            className="font-headline-md text-headline-md font-bold text-on-surface truncate pr-md"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close modal"
            className="p-xs text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="w-full flex-1">{children}</div>
      </Card>
    </div>
  );
}
