import { Link } from "react-router-dom";

export default function AuthFooter({
    question,
    linkText,
    to,
}) {
    return (
        <div className="pt-md text-center">
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