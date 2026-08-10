import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export default function AuthFooter({
  question = "",
  linkText = "",
  to = "/",
  className,
}) {
  return (
    <div className={cn("pt-md text-center", className)}>
      <p className="text-body-md text-on-surface-variant">
        {question}

        <Link
          to={to}
          className="ml-xs font-semibold text-primary hover:underline"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
