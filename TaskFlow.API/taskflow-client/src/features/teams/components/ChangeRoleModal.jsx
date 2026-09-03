import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function ChangeRoleModal({
  isOpen,
  onClose,
  member,
  onChangeRole,
}) {
  const [selectedRole, setSelectedRole] = useState("Member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      // Pre-select current role, but cap at Admin (Owner cannot be set)
      const currentRole = member.role || "Member";
      setSelectedRole(currentRole === "Owner" ? "Admin" : currentRole);
      setIsSubmitting(false); // Ensure pristine state on open
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const currentRoleNormalized =
    member.role === "Owner" ? "Admin" : member.role || "Member";
  const hasChanged = selectedRole !== currentRoleNormalized;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanged || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // member.id is the TeamMember row PK (integer).
      // The teamId is required for the team-scoped member endpoint.
      await onChangeRole?.(member.id, selectedRole);
      onClose();
    } catch (error) {
      console.error("Failed to change role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Role — ${member.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-lg w-full">
        <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="text-xs text-on-surface-variant font-medium block">
            Current Member:
          </span>
          <span className="text-body-md font-bold text-on-surface">
            {member.name}
          </span>
          <span className="ml-sm text-xs text-on-surface-variant">
            ({member.role})
          </span>
        </div>

        <div className="space-y-xs w-full">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            New Role *
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[10px] px-md text-body-sm font-body-sm text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="Admin">🛡 Admin</option>
            <option value="Member">👤 Member</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!hasChanged || isSubmitting}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Saving...
              </span>
            ) : (
              "Save Role"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
