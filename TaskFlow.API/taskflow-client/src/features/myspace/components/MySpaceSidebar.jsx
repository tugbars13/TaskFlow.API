import { useNavigate, useLocation } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";

export default function MySpaceSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addFolder, pages } = useMySpace();

  const handleAddFolder = async (e) => {
    if (e) e.stopPropagation();
    const name = prompt("Klasör Adı:", "Yeni Klasör");
    if (name) {
      const f = await addFolder(name);
      navigate("/myspace/folder/" + f.id);
    }
  };

  const isHomeActive = location.pathname === "/myspace";
  let isFoldersActive = false;
  let isPagesActive = false;

  if (location.pathname.startsWith("/myspace/folder")) {
    isFoldersActive = true;
  } else if (location.pathname === "/myspace/pages") {
    isPagesActive = true;
  } else if (location.pathname.startsWith("/myspace/page/")) {
    const pageId = parseInt(location.pathname.split("/").pop());
    const page = pages.find((p) => p.id === pageId);
    if (page && page.folderId !== null && page.folderId !== undefined) {
      isFoldersActive = true;
    } else {
      isPagesActive = true;
    }
  }

  return (
    <div className="w-[220px] border-r border-gray-200 bg-gray-50/30 flex flex-col h-full shrink-0">
      <div
        className="p-3 flex items-center gap-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => navigate("/myspace")}
      >
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[16px]">
            space_dashboard
          </span>
        </div>
        <span className="font-medium text-[13px] text-gray-800">My Space</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Quick Links */}
        <div>
          <button
            onClick={() => navigate("/myspace")}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] rounded-md transition-colors text-left ${
              isHomeActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-600 hover:bg-primary/5 hover:text-primary font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isHomeActive ? "'FILL' 1" : "'FILL' 0" }}>
              home
            </span>
            Home
          </button>
        </div>

        {/* Workspace / Navigation */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between group">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              WORKSPACE
            </h3>
            <button
              onClick={handleAddFolder}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-opacity flex items-center justify-center p-0.5 rounded hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>
          
          <div className="space-y-0.5">
            {/* Klasörler Link */}
            <button
              onClick={() => navigate("/myspace/folders")}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] rounded-md transition-colors text-left ${
                isFoldersActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-primary/5 hover:text-primary font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isFoldersActive ? "'FILL' 1" : "'FILL' 0" }}>
                folder_open
              </span>
              Klasörler
            </button>

            {/* Sayfalar Link */}
            <button
              onClick={() => navigate("/myspace/pages")}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] rounded-md transition-colors text-left ${
                isPagesActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-primary/5 hover:text-primary font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isPagesActive ? "'FILL' 1" : "'FILL' 0" }}>
                description
              </span>
              Sayfalar
            </button>

            <div className="my-2 mx-2 border-t border-gray-100"></div>

            {/* Add New Folder Button */}
            <button
              onClick={handleAddFolder}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-gray-500 hover:bg-primary/5 hover:text-primary font-medium rounded-md transition-colors text-left group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:text-primary transition-colors">add</span>
              <span>Yeni Klasör</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
