import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";
import PagesSection from "../components/PagesSection";
import FolderSection from "../components/FolderSection";
import NewMenu from "../components/NewMenu";
import { Button } from "@/components/ui";

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, pages, addPage, addFolder, updateFolder, isLoading } = useMySpace();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isLoading)
    return <div className="p-10 text-gray-500 text-sm">Yükleniyor...</div>;

  const folderIdInt = parseInt(id);
  const folder = folders.find((f) => f.id === folderIdInt);
  if (!folder)
    return <div className="p-10 text-gray-500 text-sm">Klasör bulunamadı.</div>;

  const subfolders = folders.filter((f) => f.parentFolderId === folderIdInt);
  const folderPages = pages.filter((p) => p.folderId === folderIdInt);

  const handleNewPage = async () => {
    setIsNewMenuOpen(false);
    const p = await addPage(folder.id);
    navigate("/myspace/page/" + p.id);
  };

  const handleNewFolder = async () => {
    setIsNewMenuOpen(false);
    const f = await addFolder("Yeni Klasör", folder.id);
    if (f?.id) navigate("/myspace/folder/" + f.id);
  };

  const handleDoubleClick = () => {
    setEditName(folder.name);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    const trimmed = editName.trim();
    if (!trimmed || trimmed === folder.name) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateFolder(folder.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      alert("Klasör adı güncellenemedi.");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto pt-6 pb-12 px-8 sm:px-12 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[22px] text-gray-400 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                folder
              </span>
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="bg-transparent border border-primary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-0.5 text-xl font-semibold text-gray-900 tracking-tight min-w-[250px]"
                />
              ) : (
                <span 
                  onDoubleClick={handleDoubleClick}
                  className="cursor-text hover:bg-gray-50 px-2 py-0.5 -ml-2 rounded transition-colors select-none"
                  title="Düzenlemek için çift tıklayın"
                >
                  {folder.name}
                </span>
              )}
            </h1>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-sm font-medium border-red-200 text-red-700 hover:text-red-900 hover:bg-gray-50 rounded-lg shadow-none inline-flex items-center justify-center gap-2"
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              >
                <span className="text-[24px] leading-[1] font-light">+</span>
              </Button>
              {isNewMenuOpen && (
                <NewMenu
                  onClose={() => setIsNewMenuOpen(false)}
                  onNewPage={handleNewPage}
                  onNewFolder={handleNewFolder}
                />
              )}
            </div>
          </div>

          {subfolders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Alt Klasörler</h2>
              <FolderSection
                folders={subfolders}
                onFolderClick={(f) => navigate("/myspace/folder/" + f.id)}
              />
            </div>
          )}

          <PagesSection
            pages={folderPages}
            onPageClick={(p) => navigate("/myspace/page/" + p.id)}
            hideHeader={true}
            onNewPage={handleNewPage}
          />
        </div>
      </div>
    </div>
  );
}
