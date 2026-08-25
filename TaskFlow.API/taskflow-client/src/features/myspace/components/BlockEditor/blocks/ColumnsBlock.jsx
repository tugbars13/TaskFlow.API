import React from "react";
export default function ColumnsBlock({ block, updateBlock, onKeyDown, renderBlocks }) {
  const cols = block.columns || [{ children: [] }, { children: [] }];
  
  return (
    <div className="flex gap-4 my-2 w-full">
      {cols.map((col, idx) => (
        <div key={idx} className="flex-1 flex flex-col gap-1 min-w-0 border border-transparent hover:border-gray-100 p-1 rounded transition-colors">
           {renderBlocks ? renderBlocks(col.children || [], `${block.id}-col-${idx}`) : (
             <div className="text-[12px] text-gray-400 italic">Kolon içi geliştirme aşamasında...</div>
           )}
        </div>
      ))}
    </div>
  );
}
