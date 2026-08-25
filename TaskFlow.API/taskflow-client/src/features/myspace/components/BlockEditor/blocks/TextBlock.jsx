import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function TextBlock({ block, updateBlock, onKeyDown, placeholder }) {
  return (
    <ContentEditable
      className="w-full min-h-[24px] text-[15px] text-gray-800 outline-none leading-relaxed empty:before:content-[attr(placeholder)] empty:before:text-gray-300 whitespace-pre-wrap break-words"
      value={block.content}
      onChange={(val) => updateBlock(block.id, { content: val })}
      onKeyDown={(e) => onKeyDown(e, block.id)}
      placeholder={placeholder}
      dataBlockId={block.id}
    />
  );
}