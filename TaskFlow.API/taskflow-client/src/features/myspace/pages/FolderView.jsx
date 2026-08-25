import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";
import PagesSection from "../components/PagesSection";
import NewMenu from "../components/NewMenu";
import { Button } from "@/components/ui";

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, pages, addPage, isLoading } = useMySpace();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  if (isLoading) return <div className="p-10 text-gray-500 text-sm">Yükleniyor...</div>;

  const folder = folders.find((f) => f.id === parseInt(id));
  if (!folder)
    return <div className="p-10 text-gray-500 text-sm">Klasör bulunamad.</div>;

  const folderPages = pages.filter((p) => p.folderId === folder.id);

  const handleNewPage = async () => {
    setIsNewMenuOpen(false);
    const p = await addPage(folder.id);
    navigate("/myspace/page/" + p.id);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto pt-6 pb-12 px-8 sm:px-12 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[22px] text-gray-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                folder
              </span>
              {folder.name}
            </h1>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-sm font-medium border-red-200 text-red-700 hover:text-red-900 hover:bg-gray-50 rounded-lg shadow-none inline-flex items-center justify-center gap-2"
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              >
                <span className="text-[24px] leading-[1] font-light">+</span>
                <span>New Page</span>
              </Button>
              {isNewMenuOpen && (
                <NewMenu
                  onClose={() => setIsNewMenuOpen(false)}
                  onNewPage={handleNewPage}
                  onNewFolder={() =>
                    alert("Klasör içinde klasr u an desteklenmiyor.")
                  }
                />
              )}
            </div>
          </div>

          <PagesSection
            pages={folderPages}
            onPageClick={(p) => navigate("/myspace/page/" + p.id)}
            hideHeader={true}
          />
        </div>
      </div>
    </div>
  );
}
