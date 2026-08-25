export default function Block({ children }) {
  return (
    <div className="flex items-start gap-2 group relative">
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 absolute -left-10">
        <span className="material-symbols-outlined text-[16px] text-gray-300 hover:text-gray-500 cursor-pointer" title="Blok ekle">add</span>
        <span className="material-symbols-outlined text-[16px] text-gray-300 hover:text-gray-500 cursor-grab" title="Srkle">drag_indicator</span>
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
