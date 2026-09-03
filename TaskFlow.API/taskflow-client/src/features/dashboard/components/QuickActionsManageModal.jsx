import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";

export default function QuickActionsManageModal({ isOpen, onClose, availableActions, initialSelectedIds, onSave }) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

  const toggleAction = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(selectedIds);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hızlı Erişimleri Yönet">
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {availableActions.map((action) => {
          const isSelected = selectedIds.includes(action.id);
          return (
            <div
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:bg-surface-container/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("size-9 rounded-xl flex items-center justify-center", action.iconCls)}>
                  <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-on-surface">{action.label}</div>
                  <div className="text-[11px] text-on-surface-variant/55">{action.sub}</div>
                </div>
              </div>
              <div
                className={cn(
                  "size-5 rounded flex items-center justify-center border",
                  isSelected
                    ? "bg-primary border-primary text-white"
                    : "border-outline-variant/50 text-transparent"
                )}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg font-medium text-[13px] text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          İptal
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg font-medium text-[13px] bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Kaydet
        </button>
      </div>
    </Modal>
  );
}
