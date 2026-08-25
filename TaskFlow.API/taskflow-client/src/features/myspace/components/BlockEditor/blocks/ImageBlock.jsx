import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function ImageBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="my-4">
      {block.url ? (
        <img src={block.url} alt="Image" className="max-w-full rounded-md border border-gray-200" contentEditable={false} />
      ) : (
        <div className="w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400">
          <span className="material-symbols-outlined text-[24px] mb-2">image</span>
          <span className="text-[13px]">Görsel URL'si ekleyin</span>
        </div>
      )}
      <ContentEditable
        className="mt-2 text-[12px] text-gray-400 outline-none text-center empty:before:content-['Görsel_URL_girin...']"
        value={block.url}
        onChange={(val) => updateBlock(block.id, { url: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </div>
  );
}