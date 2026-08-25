import React, { useState } from "react";
import { ContentEditable } from "./ContentEditable";
export default function ToggleBlock({ block, updateBlock, onKeyDown, renderBlocks }) {
  const [isOpen, setIsOpen] = useState(false);
  const children = block.children || [];
  
  return (
    <div className="w-full my-2">
      <div className="flex items-start gap-1">
        <button 
          className="mt-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors shrink-0"
          onClick={() => setIsOpen(!isOpen)}
          contentEditable={false}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>arrow_right</span>
        </button>
        <ContentEditable
          className="flex-1 outline-none text-[15px] font-medium text-gray-800 min-h-[24px] empty:before:content-['Açılır_kapanır_başlık...'] empty:before:text-gray-300"
          value={block.content}
          onChange={(val) => updateBlock(block.id, { content: val })}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          dataBlockId={block.id}
        />
      </div>
      {isOpen && (
        <div className="pl-6 mt-1 border-l border-gray-100 ml-[10px]">
          {renderBlocks ? renderBlocks(children, block.id) : (
            <div className="text-[13px] text-gray-400 italic">Toggle içi geliştirme aşamasında...</div>
          )}
        </div>
      )}
    </div>
  );
}