import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { generateTaskBreakdown } from "../api/taskService";

export default function TaskBreakdownModal({
  isOpen,
  onClose,
  task,
  onAddSubtasks
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [forceGenerate, setForceGenerate] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setLoading(false);
      setError(null);
      setResult(null);
      setSelectedIds(new Set());
      setForceGenerate(false);
      fetchBreakdown();
    }
  }, [isOpen, task]);

  const fetchBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateTaskBreakdown(task.id);
      setResult(data);
      // Select all by default
      if (data?.subtasks) {
        setSelectedIds(new Set(data.subtasks.map((_, i) => i)));
      }
    } catch (err) {
      setError(
        err.response?.data?.Message || 
        "Bu görev için şu anda AI alt görev önerileri oluşturulamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleToggleCheck = (index) => {
    const next = new Set(selectedIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIds(next);
  };

  const handleCreateSelected = async () => {
    if (!result?.subtasks) return;
    
    const tasksToCreate = result.subtasks.filter((_, i) => selectedIds.has(i));
    if (tasksToCreate.length === 0) return;

    await onAddSubtasks(tasksToCreate);
    onClose();
  };

  const showExistingWarning = result?.hasExistingSubtasks && !forceGenerate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ AI Task Breakdown"
      maxWidth="md:max-w-[640px]"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-on-surface-variant">
          Bu görevi daha küçük ve uygulanabilir adımlara ayıralım.
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant font-medium">
              AI görevi analiz ediyor...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {!loading && !error && showExistingWarning && (
          <div className="bg-warning/10 text-warning p-4 rounded-lg flex flex-col gap-3">
            <p className="font-medium text-sm">
              Bu görev için {result.existingSubtaskCount} alt görev zaten oluşturulmuş.
            </p>
            <Button
              variant="tonal"
              className="self-start text-warning hover:bg-warning/20"
              onClick={() => setForceGenerate(true)}
            >
              Yine de yeni AI önerileri oluştur
            </Button>
          </div>
        )}

        {!loading && !error && result?.subtasks && (!result.hasExistingSubtasks || forceGenerate) && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              {result.subtasks.length} alt görev önerildi
            </div>
            
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2">
              {result.subtasks.map((subtask, i) => (
                <label 
                  key={i} 
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIds.has(i) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedIds.has(i)}
                    onChange={() => handleToggleCheck(i)}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-on-surface">
                      {subtask.title}
                    </span>
                    {subtask.description && (
                      <span className="text-xs text-on-surface-variant mt-0.5">
                        {subtask.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-outline-variant/10">
        <Button variant="text" onClick={onClose}>
          Vazgeç
        </Button>
        <Button 
          variant="filled" 
          onClick={handleCreateSelected}
          disabled={loading || !!error || selectedIds.size === 0 || showExistingWarning}
        >
          Seçilenleri Görev Olarak Ekle ({selectedIds.size})
        </Button>
      </div>
    </Modal>
  );
}
