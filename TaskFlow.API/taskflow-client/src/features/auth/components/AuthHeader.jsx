import { cn } from "@/utils/cn";

export default function AuthHeader({ title = "", subtitle = "", className }) {
  return (
    <div className={cn("text-center md:text-left mb-xl", className)}>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
        {title}
      </h2>

      <p className="mt-sm text-body-md text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
