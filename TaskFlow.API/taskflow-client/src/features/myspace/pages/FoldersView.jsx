import { useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";
import FolderSection from "../components/FolderSection";

export default function FoldersView() {
  const navigate = useNavigate();
  const { folders, isLoading } = useMySpace();

  if (isLoading) return <div className="p-10 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto py-8 px-8 sm:px-12 space-y-8">
          <div className="flex items-end justify-between border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[28px] text-primary">folder_open</span>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tüm Klasörler</h1>
              </div>
              <p className="text-[14px] text-gray-500 mt-1 pl-10">
                Workspace'inizdeki tüm klasörler.
              </p>
            </div>
          </div>
          <FolderSection 
            folders={folders} 
            onFolderClick={(f) => navigate("/myspace/folder/" + f.id)} 
          />
        </div>
      </div>
    </div>
  );
}
