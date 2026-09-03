import { formatLongDate } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routesConstants";

export default function GreetingSection() {
  const navigate = useNavigate();
  const dateString = formatLongDate();

  return (
    <header className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface leading-none tracking-tight">
          Today
        </h1>
        <p className="text-sm text-on-surface-variant mt-1.5 leading-none font-medium">
          {dateString}
        </p>
      </div>
    </header>
  );
}
