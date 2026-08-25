import { useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";

export default function MySpaceSidebar() {
  const navigate = useNavigate();
  const { folders, addFolder, deleteFolder } = useMySpace();

  const handleAddFolder = async (e) => {
    if (e) e.stopPropagation();
    const name = prompt("Klasör Adı:", "Yeni Klasör");
    if (name) {
      const f = await addFolder(name);
      navigate("/myspace/folder/" + f.id);
    }
  };

  return (
    <div className="w-[220px] border-r border-gray-200 bg-gray-50/30 flex flex-col h-full shrink-0">
      <div 
        className="p-3 flex items-center gap-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => navigate("/myspace")}
      >
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
        </div>
        <span className="font-medium text-[13px] text-gray-800">My Workspace</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Quick Links */}
        <div>
          <button 
            onClick={() => navigate("/myspace")}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px] text-gray-400">home</span>
            Home
          </button>
        </div>

        {/* Workspace / Folders */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between group">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">WORKSPACE</h3>
            <button 
              onClick={handleAddFolder}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity flex items-center justify-center p-0.5 rounded hover:bg-gray-200"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>
          <div className="space-y-0.5">
            {folders.map((folder) => (
              <div 
                key={folder.id}
                onClick={() => navigate("/myspace/folder/" + folder.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-gray-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    folder
                  </span>
                  <span className="truncate">{folder.name}</span>
                </div>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all shrink-0"
                  onClick={(e) => { e.stopPropagation(); if(window.confirm("Klasörü silmek istediğinize emin misiniz?")) { deleteFolder(folder.id).then(() => navigate("/myspace")).catch(err => alert("Silinirken hata oluştu: " + err?.response?.data?.message || err.message)); } }}
                >
                  <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                </button>
              </div>
            ))}
            
            {/* Add New Folder Button */}
            <button 
              onClick={handleAddFolder}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 mt-1 text-[13px] text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors text-left group"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Yeni Klasör</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



