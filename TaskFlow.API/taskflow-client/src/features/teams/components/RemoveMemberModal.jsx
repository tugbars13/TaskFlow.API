import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function RemoveMemberModal({ isOpen, onClose, member, onRemoveMember }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleRemove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRemoveMember?.(member.id);
      onClose();
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Member">
      <div className="space-y-lg w-full">
        <div className="p-md rounded-2xl bg-error-container/10 border border-error/20 flex items-start gap-md">
          <span className="material-symbols-outlined text-[24px] text-error shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="text-body-sm font-medium text-on-surface">
              Are you sure you want to remove <strong className="text-on-surface">{member.name}</strong> from the team?
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              They will lose access to team deliverables and milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10 w-full mt-lg">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting}
            className="px-xl py-md bg-error text-on-error font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Removing...
              </span>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
