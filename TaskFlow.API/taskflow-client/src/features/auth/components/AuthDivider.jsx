export default function AuthDivider({
    text
}) {
    return (
        <div className="relative flex items-center py-md">
            <div className="flex-grow border-t border-border-subtle" />

            <span className="mx-md text-label-sm text-on-surface-variant">
                {text}
            </span>

            <div className="flex-grow border-t border-border-subtle" />
        </div>
    );
}