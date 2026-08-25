import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function LinkBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="my-2">
      <a href={block.url || "#"} target="_blank" rel="noreferrer" contentEditable={false} className="text-indigo-600 hover:underline inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">link</span>
        {block.content || "Bağlantı"}
      </a>
      <ContentEditable
        className="mt-1 text-[12px] text-gray-400 outline-none empty:before:content-['URL_girin...']"
        value={block.url}
        onChange={(val) => updateBlock(block.id, { url: val, content: block.content })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </div>
  );
}