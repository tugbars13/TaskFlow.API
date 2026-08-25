import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function HeadingBlock({ block, updateBlock, onKeyDown }) {
  const level = block.type === "heading_1" ? 1 : block.type === "heading_2" ? 2 : 3;
  const sizeClass = level === 1 ? "text-[28px] font-bold mt-6 mb-2" : level === 2 ? "text-[22px] font-semibold mt-4 mb-2" : "text-[18px] font-semibold mt-3 mb-1";
  
  return (
    <ContentEditable
      className={`w-full outline-none text-gray-900 ${sizeClass} empty:before:content-['Başlık_Yazın...'] empty:before:text-gray-300`}
      value={block.content}
      onChange={(val) => updateBlock(block.id, { content: val })}
      onKeyDown={(e) => onKeyDown(e, block.id)}
      dataBlockId={block.id}
    />
  );
}