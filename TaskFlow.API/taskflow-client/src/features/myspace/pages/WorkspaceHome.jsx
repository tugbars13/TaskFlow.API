import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";
import FolderSection from "../components/FolderSection";
import PagesSection from "../components/PagesSection";
import RecentSection from "../components/RecentSection";
import NewMenu from "../components/NewMenu";
import { Button } from "@/components/ui";

export default function WorkspaceHome() {
  const navigate = useNavigate();
  const { folders, pages, addFolder, addPage, isLoading } = useMySpace();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  if (isLoading) return <div className="p-10 text-gray-500">Yükleniyor...</div>;

  const rootPages = pages.filter((p) => !p.folderId);
  const recentPages = [...pages].sort((a, b) => b.id - a.id).slice(0, 5);

  const handleNewFolder = async () => {
    setIsNewMenuOpen(false);
    const name = prompt("Klasör Ad:", "Yeni Klasör");
    if (name) {
      const f = await addFolder(name);
      navigate("/myspace/folder/" + f.id);
    }
  };

  const handleNewPage = async () => {
    setIsNewMenuOpen(false);
    const p = await addPage(null);
    navigate("/myspace/page/" + p.id);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto py-8 px-8 sm:px-12 space-y-8">
          <div className="flex items-end justify-between border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[28px] text-primary">
                  space_dashboard
                </span>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  My Space
                </h1>
              </div>
              <p className="text-[14px] text-gray-500 mt-1 pl-10">
                Tüm notlarınız ve kişisel dosyalarınız.
              </p>
            </div>
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 h-8 text-[13px] px-3 shadow-sm rounded-md"
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
              </Button>
              {isNewMenuOpen && (
                <NewMenu
                  onClose={() => setIsNewMenuOpen(false)}
                  onNewFolder={handleNewFolder}
                  onNewPage={handleNewPage}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
            <div className="flex-1 min-w-0 space-y-10 w-full">
              <FolderSection
                folders={folders.slice(0, 3)}
                onFolderClick={(f) => navigate("/myspace/folder/" + f.id)}
                onViewAll={() => navigate("/myspace/folders")}
              />
              <PagesSection
                pages={rootPages.slice(0, 5)}
                onPageClick={(p) => navigate("/myspace/page/" + p.id)}
                onViewAll={() => navigate("/myspace/pages")}
                onNewPage={handleNewPage}
              />
            </div>

            <div className="w-full lg:w-[260px] xl:w-[300px] shrink-0">
              <RecentSection
                items={recentPages.map((p) => ({
                  ...p,
                  location:
                    folders.find((f) => f.id === p.folderId)?.name ||
                    "My Space",
                }))}
                onPageClick={(p) => navigate("/myspace/page/" + p.id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
