export default function AuthHeader({
  title,
  subtitle,
}) {
  return (
    <div className="text-center md:text-left mb-xl">
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
        {title}
      </h2>

      <p className="mt-sm text-body-md text-on-surface-variant">
        {subtitle}
      </p>
    </div>
  );
}