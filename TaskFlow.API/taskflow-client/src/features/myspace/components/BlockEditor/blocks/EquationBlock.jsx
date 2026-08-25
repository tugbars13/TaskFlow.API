import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function EquationBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="my-3 py-2 px-4 bg-gray-50 rounded text-center border border-gray-200 flex justify-center items-center min-h-[40px]">
      <ContentEditable
        className="outline-none font-mono text-[16px] text-gray-800 empty:before:content-['E=mc^2'] empty:before:text-gray-400 min-w-[50px]"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </div>
  );
}