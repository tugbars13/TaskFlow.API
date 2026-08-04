import { useState } from "react";
import { Link } from "react-router-dom";

// ── Role badge config ──────────────────────────────────────────────────────────
// Returns a styled badge element for a given team role string.
function RoleBadge({ role }) {
  const r = (role || "").toLowerCase();
  if (r === "owner") {
    return (
      <span className="inline-flex items-center gap-[3px] text-[11px] font-bold px-[10px] py-[3px] rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        👑 Owner
      </span>
    );
  }
  if (r === "admin") {
    return (
      <span className="inline-flex items-center gap-[3px] text-[11px] font-bold px-[10px] py-[3px] rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
        🛡 Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[3px] text-[11px] font-bold px-[10px] py-[3px] rounded-xl bg-surface-container-high text-on-surface-variant">
      👤 Member
    </span>
  );
}

export default function TeamCard({
  team,
  isExpanded,
  onToggleExpand,
  onOpenAddMember,
  onOpenAssignTask,
  onOpenChangeRole,
  onOpenRemoveMember,
  onOpenDeleteTeam,
}) {
  if (!team) return null;

  const { id, name, memberCount, userRole, members = [], icon = "groups" } = team;
  const [activeMenuMemberId, setActiveMenuMemberId] = useState(null);

  // ── Permission flags for the current user ─────────────────────────────────
  // Normalize to lowercase. If userRole is empty the user has no team role — treat as Member.
  const currentRole = (userRole || "member").toLowerCase();
  const isOwner = currentRole === "owner";
  const isAdmin = currentRole === "admin";
  const isMember = !isOwner && !isAdmin; // true only when neither owner nor admin

  // Add Member & Assign Task: Owner or Admin
  const canAddMember = isOwner || isAdmin;
  const canAssignTask = isOwner || isAdmin;

  // Change Role & Remove Member: Owner only
  const canChangeRoles = isOwner;
  const canRemoveMembers = isOwner;


  const toggleMemberMenu = (e, memberId) => {
    e.stopPropagation();
    setActiveMenuMemberId((prev) => (prev === memberId ? null : memberId));
  };

  return (
    <div
      onClick={() => onToggleExpand?.(id)}
      className="w-full bg-surface border border-outline-variant/10 hover:border-primary/30 rounded-2xl p-md lg:px-lg lg:py-md apple-shadow hover:apple-shadow-hover transition-all duration-200 group cursor-pointer relative"
    >
      {/* 1. Team Header Bar */}
      <div className="flex items-center justify-between gap-md">
        {/* Team Icon & Name */}
        <div className="flex items-center gap-md min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 apple-shadow">
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs font-medium text-on-surface-variant">
              {memberCount || members.length} Members
            </p>
          </div>
        </div>

        {/* Current User's Role Badge & Accordion Chevron */}
        <div className="flex items-center gap-md shrink-0">
          {userRole && <RoleBadge role={userRole} />}
          <div className="w-8 h-8 rounded-xl bg-surface-container-high/60 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Expanded Content */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="border-t border-outline-variant/10 pt-md mt-md space-y-md animate-fade-in"
        >
          {/* Header Row: Member count + Add Member (Owner/Admin only) */}
          <div className="flex items-center justify-between gap-md">
            <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Team Members ({members.length})
            </div>

            <div className="flex items-center gap-sm">
              <Link
                to={`/teams/${id}/tasks`}
                className="flex items-center gap-xs px-md py-xs bg-secondary/10 text-secondary font-bold text-xs rounded-xl hover:bg-secondary/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">task</span>
                Tasks
              </Link>
              {canAddMember && (
                <button
                  type="button"
                  onClick={() => onOpenAddMember?.(team)}
                  className="flex items-center gap-xs px-md py-xs bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Member
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onOpenDeleteTeam?.(team)}
                  className="flex items-center gap-xs px-md py-xs bg-error/10 text-error font-bold text-xs rounded-xl hover:bg-error/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete Team
                </button>
              )}
            </div>
          </div>

          {/* Member List — sorted Owner → Admins → Members (sorting done in TeamPage) */}
          <div className="space-y-xs">
            {members.map((member) => {
              const isMenuOpen = activeMenuMemberId === member.id;
              const memberRoleLower = (member.role || "").toLowerCase();
              const isThisMemberOwner = memberRoleLower === "owner";

              // Whether the three-dot menu should appear for this row
              // Owner sees full menu on non-owner rows.
              // Admin sees only Assign Task on non-owner rows.
              // Member sees nothing.
              const showMenu =
                !isThisMemberOwner && // Never show actions on the Owner row
                (canRemoveMembers || (canAssignTask && !isMember)); // Owner or Admin

              return (
                <div
                  key={member.id || member.email}
                  className="flex items-center justify-between p-xs sm:px-md py-sm rounded-xl hover:bg-surface-container-low/60 transition-colors relative"
                >
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-md min-w-0">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-9 h-9 rounded-xl object-cover apple-shadow border border-outline-variant/20 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-headline-md text-body-md font-bold text-on-surface truncate flex items-center gap-[5px]">
                        {isThisMemberOwner && (
                          <span className="text-amber-500" title="Team Owner">👑</span>
                        )}
                        {member.name}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Role Badge + Action Menu (⋮) */}
                  <div className="flex items-center gap-sm shrink-0">
                    <RoleBadge role={member.role} />

                    {/* Three-Dot Menu */}
                    {showMenu && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => toggleMemberMenu(e, member.id)}
                          aria-label="Member Actions"
                          className="w-8 h-8 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl apple-shadow z-50 p-1.5 space-y-0.5 animate-scale-up"
                          >
                            {/* Assign Task — Owner & Admin */}
                            {canAssignTask && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  onOpenAssignTask?.(member, team);
                                }}
                                className="w-full text-left px-md py-xs text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl flex items-center gap-xs transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] text-primary">assignment_add</span>
                                Assign Task
                              </button>
                            )}

                            {/* Change Role — Owner only, non-Owner target */}
                            {canChangeRoles && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  onOpenChangeRole?.(member, team);
                                }}
                                className="w-full text-left px-md py-xs text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl flex items-center gap-xs transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] text-purple-600">manage_accounts</span>
                                Change Role
                              </button>
                            )}

                            {/* Remove Member — Owner only, non-Owner target */}
                            {canRemoveMembers && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMemberId(null);
                                  onOpenRemoveMember?.(member, team);
                                }}
                                className="w-full text-left px-md py-xs text-xs font-semibold text-error hover:bg-error-container/20 rounded-xl flex items-center gap-xs transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                Remove Member
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
