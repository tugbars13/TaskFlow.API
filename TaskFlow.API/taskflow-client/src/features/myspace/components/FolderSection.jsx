import { cn } from "@/utils/cn";

export function FolderCard({ folder, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm hover:bg-gray-50/50 transition-all text-left group"
    >
      <span className={cn("material-symbols-outlined text-[20px] shrink-0", folder.iconColor || "text-indigo-400")} style={{ fontVariationSettings: "'FILL' 1" }}>
        {folder.icon || "folder"}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-medium text-gray-700 truncate group-hover:text-gray-900">{folder.name}</h3>
      </div>
    </button>
  );
}

export default function FolderSection({ folders, onFolderClick }) {
  if (!folders || folders.length === 0) return null;
  
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Klasrler</h2>
      </div>
      <div 
        className="grid gap-3" 
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
      >
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} onClick={() => onFolderClick(folder)} />
        ))}
      </div>
    </section>
  );
}
