import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CreateTeamModal({ isOpen, onClose, onCreateTeam }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    onCreateTeam?.({
      name: teamName.trim(),
      description: description.trim(),
    });

    setTeamName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-lg w-full">
        <Input
          label="Team Name *"
          placeholder="e.g. Backend Engineering"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />

        <div className="space-y-xs w-full">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of this team's focus area..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-high/50 border-none rounded-2xl p-md text-body-sm font-body-sm text-on-surface placeholder:text-outline/60 apple-shadow focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10 w-full">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!teamName.trim()}
            className="px-xl py-md rounded-2xl font-bold text-xs shadow-md"
          >
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}
