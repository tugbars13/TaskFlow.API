import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function SelectTeamModal({ isOpen, onClose, teams = [], onSelectTeam }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Team">
      <div className="space-y-md w-full">
        <p className="text-body-md text-on-surface-variant">
          Please select a team for this task:
        </p>
        <div className="flex flex-col gap-sm">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                onSelectTeam(team.id);
                onClose();
              }}
              className="w-full text-left px-md py-md bg-surface-container-high/50 hover:bg-primary/10 hover:text-primary border-none rounded-2xl text-body-md font-bold text-on-surface transition-colors duration-200 apple-shadow flex items-center justify-between group"
            >
              <span>{team.name}</span>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end pt-md border-t border-outline-variant/10 w-full mt-lg">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
