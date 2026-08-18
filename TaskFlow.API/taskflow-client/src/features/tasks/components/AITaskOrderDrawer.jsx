import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import api from "@/api/client/axios";

import { createPortal } from "react-dom";

export default function AITaskOrderDrawer({ isOpen, onClose }) {
  const [orderedTasks, setOrderedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && orderedTasks.length === 0 && !loading) {
      fetchAiOrder();
    }
  }, [isOpen]);

  const fetchAiOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      // Calls the new TasksController endpoint
      const response = await api.get("/tasks/ai-order");
      if (response.data?.success) {
        setOrderedTasks(response.data.data);
      } else {
        setError("Failed to fetch AI task order.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating the AI task order.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 w-[400px] bg-surface shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300">
        <div className="p-xl border-b border-outline-variant/20 flex justify-between items-start bg-primary/5">
          <div>
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">
                auto_awesome
              </span>
              AI Task Order
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-2 max-w-[280px]">
              Mevcut görevlerini ve çalışma durumunu analiz ederek sana özel bir çalışma sırası oluşturdum.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-md">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-primary">
              <Spinner size="lg" />
              <p className="text-sm font-medium animate-pulse">Yapay zeka analiz ediyor...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-error-container/20 text-error rounded-xl text-sm font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          ) : (
            orderedTasks.map((task, index) => (
              <div key={task.taskId} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm flex gap-3 items-start hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-on-surface mb-1">{task.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider mb-2">
                    <span className={
                      task.priority === "High" ? "text-error" : 
                      task.priority === "Medium" ? "text-orange-500" : 
                      "text-primary"
                    }>
                      {task.priority}
                    </span>
                    <span className="text-outline-variant/60">•</span>
                    <span className="text-on-surface-variant">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant bg-surface-container/50 p-2 rounded-lg italic">
                    "{task.reasoning}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest text-center">
          <p className="text-xs font-medium text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Bu öneri mevcut görevlerini değiştirmez.
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
