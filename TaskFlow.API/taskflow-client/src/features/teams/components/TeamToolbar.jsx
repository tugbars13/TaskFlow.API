export default function TeamToolbar({ onCreateTeamClick }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/10 pb-lg">
      <div>
        <h1 className="font-display-lg text-display-lg font-extrabold text-on-surface tracking-tight">
          Teams
        </h1>

        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Create and manage your teams and organize members.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateTeamClick}
        className="flex items-center justify-center gap-xs px-md py-[8px] bg-primary text-on-primary font-bold text-[15px] rounded-xl apple-shadow active:scale-95 hover:bg-primary/90 transition-all cursor-pointer shrink-0 leading-none"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>Create New Team</span>
      </button>
    </div>
  );
}