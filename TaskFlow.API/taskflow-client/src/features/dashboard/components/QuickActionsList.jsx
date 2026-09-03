import { useState } from "react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routesConstants";
import QuickActionsManageModal from "./QuickActionsManageModal";

const STORAGE_KEY = "taskflow_quick_actions";
const DEFAULT_ACTION_IDS = ["new_task", "new_page", "new_folder", "calendar"];

function QuickCard({ icon, iconCls, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-start gap-2 flex-1 min-w-[120px] p-3 rounded-xl border border-outline-variant/20 hover:border-primary/20 hover:bg-surface-container/30 transition-all disabled:opacity-40 disabled:cursor-default"
    >
      <div className={cn("size-9 rounded-xl flex items-center justify-center", iconCls)}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="text-left">
        <div className="text-[12px] font-semibold text-on-surface">{label}</div>
        <div className="text-[11px] text-on-surface-variant/55 leading-tight">
          {sub}
        </div>
      </div>
    </button>
  );
}

export default function QuickActionsList({ navigate, metrics }) {
  const highPriorityTasks = metrics?.highPriorityTasks ?? 0;

  const AVAILABLE_ACTIONS = [
    {
      id: "new_task",
      icon: "task_alt",
      iconCls: "bg-primary/10 text-primary",
      label: "Yeni Görev",
      sub: "Görev ekle",
      onClick: () => navigate(ROUTES.TASKS),
    },
    {
      id: "new_page",
      icon: "description",
      iconCls: "bg-blue-100 text-blue-600",
      label: "Yeni Sayfa",
      sub: "My Space'e ekle",
      onClick: () => navigate(ROUTES.MY_SPACE + "/pages"),
    },
    {
      id: "new_folder",
      icon: "create_new_folder",
      iconCls: "bg-amber-100 text-amber-600",
      label: "Yeni Klasör",
      sub: "Klasör oluştur",
      onClick: () =>
        navigate(ROUTES.MY_SPACE + "/folders", {
          state: { createFolder: true },
        }),
    },
    {
      id: "calendar",
      icon: "event",
      iconCls: "bg-red-100 text-red-500",
      label: "Terminler",
      sub: `${highPriorityTasks} risk altında`,
      onClick: () => navigate(ROUTES.CALENDAR),
    },
    {
      id: "analytics",
      icon: "analytics",
      iconCls: "bg-purple-100 text-purple-600",
      label: "Analizler",
      sub: "Raporlara git",
      onClick: () => navigate(ROUTES.ANALYTICS),
    },
    {
      id: "team",
      icon: "group",
      iconCls: "bg-emerald-100 text-emerald-600",
      label: "Takım",
      sub: "Üyeleri yönet",
      onClick: () => navigate(ROUTES.TEAM),
    },
    {
      id: "settings",
      icon: "settings",
      iconCls: "bg-gray-100 text-gray-600",
      label: "Ayarlar",
      sub: "Tercihler",
      onClick: () => navigate(ROUTES.SETTINGS),
    }
  ];

  const [activeActionIds, setActiveActionIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore JSON parse error
    }
    return DEFAULT_ACTION_IDS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeActions = activeActionIds
    .map(id => AVAILABLE_ACTIONS.find(a => a.id === id))
    .filter(Boolean);

  const handleSave = (newIds) => {
    setActiveActionIds(newIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">
              bolt
            </span>
            <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Hızlı Erişim
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Düzenle
          </button>
        </div>

        <div className="flex items-stretch justify-center flex-wrap gap-3 px-5 py-4">
          {activeActions.length === 0 ? (
            <div className="w-full text-center py-4 text-[12px] text-on-surface-variant/60">
              Hızlı erişim bulunmuyor.
            </div>
          ) : (
            activeActions.map((a) => (
              <QuickCard key={a.id} {...a} />
            ))
          )}
          <QuickCard
            icon="add"
            iconCls="bg-gray-100 text-gray-400"
            label="Ekle"
            sub="Hızlı erişime ekle"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      <QuickActionsManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableActions={AVAILABLE_ACTIONS}
        initialSelectedIds={activeActionIds}
        onSave={handleSave}
      />
    </>
  );
}
