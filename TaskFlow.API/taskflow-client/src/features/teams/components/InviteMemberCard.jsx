export default function InviteMemberCard({ onInvite }) {
  return (
    <div
      onClick={onInvite}
      className="w-full p-lg rounded-2xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 bg-surface-container-low/30 hover:bg-primary/[0.03] flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-md transition-all duration-300 hover:-translate-y-0.5 apple-shadow-hover cursor-pointer group mt-lg"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-xs shrink-0">
        <span className="material-symbols-outlined text-[24px]">add</span>
      </div>
      <div>
        <h4 className="font-headline-md text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
          Add Member
        </h4>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Invite developers, designers, or product managers to join your workspace.
        </p>
      </div>
    </div>
  );
}
