import { useEffect, useRef } from "react";

export default function NewMenu({ onClose, onNewPage, onNewFolder }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden"
    >
      <button 
        onClick={onNewPage}
        className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group"
      >
        <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-primary transition-colors">description</span>
        Yeni Sayfa
      </button>
      <button 
        onClick={onNewFolder}
        className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors text-left group"
      >
        <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-primary transition-colors">create_new_folder</span>
        Yeni Klasör
      </button>
    </div>
  );
}
