import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getInvitableUsers } from "@/features/teams/api/teamService";

const getDisplayName = (u) => u.fullName || u.name || "User";

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onAddMember,
  teamName,
  teamId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("Member");
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchRegisteredUsers = useCallback(async () => {
    if (!teamId) return;
    setLoadingUsers(true);
    try {
      const usersList = await getInvitableUsers(teamId);
      setRegisteredUsers(Array.isArray(usersList) ? usersList : []);
    } catch (err) {
      console.warn("Failed to fetch registered users:", err);
      setRegisteredUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedUser(null);
      setRole("Member");
      setStatusMessage(null);
      fetchRegisteredUsers();
    }
  }, [isOpen, fetchRegisteredUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return registeredUsers;
    return registeredUsers.filter((u) => {
      const nameStr = getDisplayName(u).toLowerCase();
      const emailStr = (u.email || "").toLowerCase();
      return nameStr.includes(q) || emailStr.includes(q);
    });
  }, [registeredUsers, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setStatusMessage({
        type: "error",
        text: "Please select a registered user from the list.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        userId: selectedUser.id,
        role: role,
        name: getDisplayName(selectedUser),
        email: selectedUser.email,
      };

      await onAddMember?.(payload);

      setStatusMessage({
        type: "success",
        text: `User "${getDisplayName(selectedUser)}" added to team!`,
      });

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error("Failed to add member:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to add member to team.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Member to ${teamName || "Team"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-md w-full">
        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`p-md rounded-2xl text-xs font-semibold flex items-center gap-sm animate-fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                : "bg-error-container/20 border border-error/30 text-error"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {statusMessage.type === "success" ? "check_circle" : "error"}
            </span>
            {statusMessage.text}
          </div>
        )}

        {/* 1. Search Registered Users */}
        <div className="space-y-xs w-full">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            Search Registered Users *
          </label>
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by full name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={submitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] pl-10 pr-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 2. Registered Users Searchable List */}
        <div className="space-y-xs w-full">
          <label className="block font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Select User ({filteredUsers.length} available)
          </label>

          <div className="max-h-48 overflow-y-auto space-y-xs p-xs bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 w-full min-h-[120px]">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-lg space-y-xs">
                <Spinner size="sm" />
                <span className="text-xs text-on-surface-variant">
                  Fetching registered users...
                </span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-md text-center text-xs text-on-surface-variant">
                No registered user matches "{searchQuery}".
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const displayName = getDisplayName(u);
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(isSelected ? null : u)}
                    className={`flex items-center justify-between p-sm px-md rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/10 border border-primary/40 text-primary font-bold shadow-xs"
                        : "hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-md min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {displayName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-body-sm font-bold truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-on-surface-variant/70 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Team Role Selection */}
        <div className="space-y-xs w-full">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            Team Role *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={submitting}
            className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* 4. Footer Action Buttons */}
        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={submitting || !selectedUser}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            {submitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Adding Member...
              </span>
            ) : (
              "Add Member"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
