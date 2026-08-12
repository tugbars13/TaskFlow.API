import { formatLongDate } from "@/utils/dateUtils";

export default function GreetingSection() {
  const dateString = formatLongDate();

  return (
    <header className="mb-8">
      <h1 className="text-2xl font-extrabold text-on-surface leading-none tracking-tight">
        Today
      </h1>
      <p className="text-sm text-on-surface-variant mt-1.5 leading-none font-medium">{dateString}</p>
    </header>
  );
}
