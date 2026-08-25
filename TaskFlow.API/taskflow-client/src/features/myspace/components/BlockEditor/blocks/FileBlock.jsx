import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function FileBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="flex items-center gap-3 my-3 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full sm:w-2/3" contentEditable={false} tabIndex={0} onKeyDown={(e) => onKeyDown(e, block.id)}>
      <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 shrink-0">
        <span className="material-symbols-outlined">description</span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <ContentEditable
          className="text-[14px] font-medium text-gray-900 outline-none empty:before:content-['Dosya_Adı'] empty:before:text-gray-400 truncate"
          value={block.name}
          onChange={(val) => updateBlock(block.id, { name: val })}
        />
        <ContentEditable
          className="text-[12px] text-gray-500 outline-none empty:before:content-['Boyut_(Örn:_2.4_MB)'] empty:before:text-gray-400"
          value={block.size}
          onChange={(val) => updateBlock(block.id, { size: val })}
        />
      </div>
      <button className="p-2 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded shadow-sm shrink-0">
        <span className="material-symbols-outlined text-[18px]">download</span>
      </button>
    </div>
  );
}