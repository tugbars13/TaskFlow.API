export default function RecentSection({ items, onPageClick }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Son Alanlar</h2>
      <div className="flex flex-col gap-1">
        {items.map(item => (
          <div 
            key={item.id} 
            onClick={() => onPageClick(item)}
            className="flex items-start justify-between py-2 px-2.5 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group border border-transparent hover:border-gray-100"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-gray-400 mt-0.5 group-hover:text-indigo-400 transition-colors shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>
                description
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 truncate">{item.title}</span>
                <span className="text-[11px] text-gray-400 truncate">{item.location} &bull; {item.lastEdited || item.lastOpened || "az nce"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
