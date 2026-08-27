export default function RecentSection({ items, onPageClick }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-primary">history</span>
        Son Alanlar
      </h2>
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div 
            key={item.id} 
            onClick={() => onPageClick(item)}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors group border border-transparent hover:border-primary/20 bg-white"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-8 rounded-md bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>
                  description
                </span>
              </div>
              <div className="flex flex-col min-w-0 py-0.5">
                <span className="text-[13px] font-medium text-gray-800 group-hover:text-primary truncate transition-colors">{item.title || "İsimsiz Sayfa"}</span>
                <span className="text-[11px] text-gray-400 truncate mt-0.5">{item.location} &bull; {item.lastEdited || item.lastOpened || "az önce"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
