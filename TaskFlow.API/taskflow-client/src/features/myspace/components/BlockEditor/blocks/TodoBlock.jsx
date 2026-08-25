import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function TodoBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="flex items-start gap-2 w-full my-1 group">
      <input 
        type="checkbox" 
        checked={block.checked || false}
        onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      <ContentEditable
        className={`flex-1 text-[15px] outline-none min-h-[24px] empty:before:content-['Yapılacak_görev...'] empty:before:text-gray-300 ${block.checked ? "line-through text-gray-400" : "text-gray-800"}`}
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </div>
  );
}