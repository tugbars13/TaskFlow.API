import { cn } from "@/utils/cn";

export default function AuthMobileLogo({ className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-sm mb-lg md:hidden",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-md font-bold text-white shadow-md">
        TF
      </div>

      <span className="font-headline-md text-headline-md font-semibold leading-[28px] text-primary">
        TaskFlow Pro
      </span>
    </div>
  );
}
