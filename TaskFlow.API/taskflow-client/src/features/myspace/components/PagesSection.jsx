import { useState, useRef, useEffect } from "react";
import { useMySpace } from "../context/MySpaceContext";

export function PageListRow({ page, onClick }) {
  const { updatePage, deletePage, duplicatePage, folders } = useMySpace();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsMoveOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsMoveOpen(false);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setEditName(page.title || "İsimsiz Sayfa");
    setIsEditing(true);
  };

  const handleRenameSave = async () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== (page.title || "İsimsiz Sayfa")) {
      await updatePage(page.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRenameSave();
    if (e.key === "Escape") setIsEditing(false);
  };

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    await duplicatePage(page);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const link = window.location.origin + "/myspace/page/" + page.id;
    navigator.clipboard.writeText(link);
    alert("Bağlantı kopyalandı!");
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if(window.confirm("Bu sayfayı silmek istediğinize emin misiniz?")) {
      deletePage(page.id);
    }
  };

  const handleMove = async (e, targetFolderId) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMoveOpen(false);
    await updatePage(page.id, { folderId: targetFolderId });
  };

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-primary/5 cursor-pointer group transition-colors border border-transparent hover:border-primary/20 relative"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span
          className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-primary transition-colors shrink-0"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          description
        </span>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border border-primary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5 text-[14px] font-medium text-gray-900 min-w-[200px]"
          />
        ) : (
          <h3 className="text-[14px] font-medium text-gray-800 group-hover:text-primary transition-colors truncate pr-4">
            {page.title || "İsimsiz Sayfa"}
          </h3>
        )}
      </div>
      
      <div className="flex items-center shrink-0 ml-auto">
        <span className="text-[12px] text-gray-500 hidden sm:block truncate group-hover:text-gray-700 transition-colors w-32">
          {page.lastEdited}
        </span>
        <div className="relative ml-2 flex items-center justify-end w-8" ref={menuRef}>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all shrink-0"
            onClick={handleMenuToggle}
          >
            <span className="material-symbols-outlined text-[16px]">
              more_horiz
            </span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-visible text-[13px]">
              <button 
                onClick={handleRename}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group/item"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/item:text-primary">edit</span>
                Yeniden Adlandır
              </button>
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoveOpen(!isMoveOpen);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group/item"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/item:text-primary">folder_open</span>
                    Klasöre Taşı
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/item:text-primary">chevron_right</span>
                </button>
                
                {isMoveOpen && (
                  <div className="absolute right-full top-0 mr-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 max-h-64 overflow-y-auto">
                    {page.folderId !== null && (
                      <button 
                        onClick={(e) => handleMove(e, null)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">remove_circle_outline</span>
                        Klasörden Çıkar
                      </button>
                    )}
                    {folders.filter(f => f.id !== page.folderId).map(f => (
                      <button 
                        key={f.id}
                        onClick={(e) => handleMove(e, f.id)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left truncate"
                        title={f.name}
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">folder</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                    {folders.length === 0 || (folders.length === 1 && folders[0].id === page.folderId) ? (
                       <div className="px-4 py-2 text-gray-400 italic text-xs">Başka klasör yok</div>
                    ) : null}
                  </div>
                )}
              </div>

              <button 
                onClick={handleDuplicate}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group/item"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/item:text-primary">content_copy</span>
                Çoğalt
              </button>
              
              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group/item"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/item:text-primary">link</span>
                Bağlantıyı Kopyala
              </button>
              
              <div className="my-1 border-t border-gray-100"></div>
              
              <button 
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left group/item"
              >
                <span className="material-symbols-outlined text-[16px] text-red-500">delete</span>
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagesSection({
  pages,
  onPageClick,
  hideHeader = false,
  onViewAll,
  onNewPage
}) {
  return (
    <section>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">description</span>
            Sayfalar
          </h2>
          {onViewAll && (
            <button onClick={onViewAll} className="text-[12px] font-medium text-primary hover:underline">
              Tümünü Gör
            </button>
          )}
        </div>
      )}

      {!pages || pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-[13px] text-gray-500 mb-3">Henüz bir sayfanız yok.</p>
          <button 
            onClick={onNewPage}
            className="text-[13px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni sayfa oluştur
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center py-2 px-4 border-b border-gray-100 mb-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-8 flex-1">
              Ad
            </div>
            <div className="flex items-center shrink-0 ml-auto">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32 hidden sm:block">
                Son Düzenleme
              </div>
              <div className="w-8 ml-2"></div>
            </div>
          </div>
          {/* List */}
          <div className="flex flex-col gap-1">
            {pages.map((page) => (
              <PageListRow
                key={page.id}
                page={page}
                onClick={() => onPageClick(page)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
