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
      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden"
    >
      <button 
        onClick={onNewPage}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="material-symbols-outlined text-[18px] text-gray-400">description</span>
        New Page
      </button>
      <button 
        onClick={onNewFolder}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="material-symbols-outlined text-[18px] text-gray-400">create_new_folder</span>
        New Folder
      </button>
    </div>
  );
}
