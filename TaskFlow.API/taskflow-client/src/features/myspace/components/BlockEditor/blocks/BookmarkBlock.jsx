import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function BookmarkBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="my-4 flex border border-gray-200 rounded-lg overflow-hidden h-[120px] hover:bg-gray-50 transition-colors group">
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <ContentEditable
          className="text-[14px] font-medium text-gray-900 outline-none truncate empty:before:content-['Başlık_girin...']"
          value={block.title}
          onChange={(val) => updateBlock(block.id, { title: val })}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          dataBlockId={block.id}
        />
        <ContentEditable
          className="text-[12px] text-gray-500 outline-none line-clamp-2 empty:before:content-['Açıklama_girin...']"
          value={block.content}
          onChange={(val) => updateBlock(block.id, { content: val })}
        />
        <ContentEditable
          className="text-[11px] text-gray-400 outline-none truncate mt-2 flex items-center gap-1 empty:before:content-['URL_girin...']"
          value={block.url}
          onChange={(val) => updateBlock(block.id, { url: val })}
        />
      </div>
      <div className="w-[160px] bg-gray-100 flex items-center justify-center shrink-0 border-l border-gray-200">
        <span className="material-symbols-outlined text-[32px] text-gray-300">image</span>
      </div>
    </div>
  );
}