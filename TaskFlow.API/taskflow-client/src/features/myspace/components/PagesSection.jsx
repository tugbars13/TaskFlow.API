import { useMySpace } from "../context/MySpaceContext";

export function PageListRow({ page, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50/80 cursor-pointer group transition-colors border-b border-transparent hover:border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          description
        </span>
        <h3 className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors truncate pr-4">
          {page.title || "İsimsiz Sayfa"}
        </h3>
      </div>
      <div className="flex items-center gap-4 shrink-0 w-32 justify-end sm:justify-start">
        <span className="text-[11px] text-gray-400 hidden sm:block truncate">
          {page.lastEdited}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-all shrink-0 ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            if(onDelete) onDelete(page.id);
          }}
        >
          <span className="material-symbols-outlined text-[14px]">
            more_horiz
          </span>
        </button>
      </div>
    </div>
  );
}

export default function PagesSection({
  pages,
  onPageClick,
  hideHeader = false,
}) {
  const { deletePage } = useMySpace();
  const handleDelete = (id) => {
    if(window.confirm("Sayfayı silmek istediğinize emin misiniz?")) {
      deletePage(id).catch(err => alert("Hata: " + err.message));
    }
  };

  return (
    <section>
      {!hideHeader && (
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Sayfalar
          </h2>
        </div>
      )}

      {!pages || pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-md border border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-[13px] text-gray-500 mb-2">Henüz bir sayfanız yok.</p>
          <button className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni sayfa oluştur
          </button>
        </div>
      ) : (
        <div className="flex flex-col border border-gray-100 rounded-md bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50/80 border-b border-gray-100">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider pl-7 flex-1">
              Ad
            </div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider w-32 hidden sm:block">
              Son Düzenleme
            </div>
          </div>
          {/* List */}
          <div className="flex flex-col py-0.5">
            {pages.map((page) => (
              <PageListRow
                key={page.id}
                page={page}
                onClick={() => onPageClick(page)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
