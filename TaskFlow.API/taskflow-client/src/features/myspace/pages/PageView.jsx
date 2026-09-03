import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMySpace } from "../context/MySpaceContext";
import BlockEditor from "../components/blockEditor/BlockEditor";

export default function PageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, folders, updatePage, deletePage, duplicatePage, isLoading } = useMySpace();
  
  const page = pages.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (page && page.folderId !== undefined) {
      if (location.state?.folderId !== page.folderId) {
        navigate(".", { replace: true, state: { ...location.state, folderId: page.folderId } });
      }
    }
  }, [page, navigate, location.state]);

  if (isLoading) return <div className="p-10 text-gray-500">Yükleniyor...</div>;
  if (!page) return <div className="p-10 text-gray-500">Sayfa bulunamad.</div>;


    const handleDelete = () => {
    if (window.confirm("Bu sayfayı silmek istediğinize emin misiniz?")) {
      deletePage(page.id).then(() => {
        if (page.folderId) navigate("/myspace/folder/" + page.folderId);
        else navigate("/myspace");
      });
    }
  };

  const handleDuplicate = () => {
    duplicatePage(page).then((newPage) => {
      navigate("/myspace/page/" + newPage.id);
    });
  };
  const folderName = page.folderId ? folders.find(f => f.id === page.folderId)?.name : "My Space";
  
  // Extend page with location just for the BlockEditor
  const pageWithLocation = { ...page, location: folderName };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <BlockEditor 
        page={pageWithLocation} 
        onBack={() => {
          if (page.folderId) navigate("/myspace/folder/" + page.folderId);
          else navigate("/myspace");
        }} 
        onChange={(data) => updatePage(page.id, data)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
}

