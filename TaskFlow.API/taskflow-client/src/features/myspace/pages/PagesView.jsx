import { useNavigate } from "react-router-dom";
import { useMySpace } from "../context/MySpaceContext";
import PagesSection from "../components/PagesSection";

export default function PagesView() {
  const navigate = useNavigate();
  const { pages, addPage, isLoading } = useMySpace();

  const handleNewPage = async () => {
    const p = await addPage(null);
    navigate("/myspace/page/" + p.id);
  };

  if (isLoading) return <div className="p-10 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto py-8 px-8 sm:px-12 space-y-8">
          <div className="flex items-end justify-between border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[28px] text-primary">description</span>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tüm Sayfalar</h1>
              </div>
              <p className="text-[14px] text-gray-500 mt-1 pl-10">
                Workspace'inizdeki tüm sayfalar.
              </p>
            </div>
          </div>
          <PagesSection 
            pages={pages.filter(p => !p.folderId)} 
            onPageClick={(p) => navigate("/myspace/page/" + p.id)} 
            hideHeader={true}
            onNewPage={handleNewPage}
          />
        </div>
      </div>
    </div>
  );
}
