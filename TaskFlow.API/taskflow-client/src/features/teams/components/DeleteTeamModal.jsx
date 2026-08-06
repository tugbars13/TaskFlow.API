import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function DeleteTeamModal({ isOpen, onClose, teamName, onDeleteTeam }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Team">
      <div className="space-y-md w-full">
        <p className="text-body-md text-on-surface-variant">
          Are you sure you want to delete <span className="font-bold">{teamName}</span>?
        </p>
        
        <div className="space-y-xs">
          <p className="text-body-sm text-error/80 font-medium">
            This action cannot be undone.
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Deleting this team will permanently remove:
          </p>
          <ul className="text-body-sm text-on-surface-variant list-disc pl-lg space-y-xs w-full pt-xs">
            <li>Team</li>
            <li>Team members</li>
            <li>Team-related data</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10 w-full mt-lg">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="filled"
            onClick={onDeleteTeam}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md active:scale-95 transition-all bg-error hover:bg-error/90 text-white border-error"
          >
            Delete Team
          </Button>
        </div>
      </div>
    </Modal>
  );
}
