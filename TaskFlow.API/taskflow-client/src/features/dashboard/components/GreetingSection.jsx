import { formatLongDate } from "@/utils/dateUtils";

export default function GreetingSection() {
  const dateString = formatLongDate();

  return (
    <header className="mb-md">
      <h1 className="text-display-lg font-bold text-on-surface tracking-tight leading-tight">
        Today
      </h1>

      <p className="text-body-lg text-on-surface-variant mt-xs">{dateString}</p>
    </header>
  );
}
