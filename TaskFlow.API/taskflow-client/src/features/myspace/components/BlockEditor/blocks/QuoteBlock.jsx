import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function QuoteBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="border-l-4 border-gray-300 pl-4 py-1 my-2">
      <ContentEditable
        className="w-full outline-none text-[16px] italic text-gray-700 min-h-[24px] empty:before:content-['Alıntı...'] empty:before:text-gray-300"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </div>
  );
}