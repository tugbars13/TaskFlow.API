import { cn } from "@/utils/cn";

export function FolderCard({ folder, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/20 hover:shadow-sm hover:bg-primary/5 transition-all text-left group"
    >
      <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          {folder.icon || "folder"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-medium text-gray-800 truncate group-hover:text-primary transition-colors">{folder.name}</h3>
      </div>
    </button>
  );
}

export default function FolderSection({ folders, onFolderClick, onViewAll }) {
  if (!folders || folders.length === 0) return null;
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">folder_open</span>
          Klasörler
        </h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-[12px] font-medium text-primary hover:underline">
            Tümünü Gör
          </button>
        )}
      </div>
      <div 
        className="grid gap-4" 
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} onClick={() => onFolderClick(folder)} />
        ))}
      </div>
    </section>
  );
}
