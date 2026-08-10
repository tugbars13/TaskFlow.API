export default function SocialButton({ children, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-sm rounded-2xl border border-border-subtle bg-surface-container-lowest px-lg py-md font-label-md text-on-surface apple-shadow apple-shadow-hover transition-all duration-200 active:scale-95"
    >
      {icon}
      {children}
    </button>
  );
}
