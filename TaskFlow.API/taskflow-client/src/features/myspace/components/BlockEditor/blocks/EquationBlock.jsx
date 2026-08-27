import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function EquationBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  return (
    <div 
      className="my-3 py-2 px-4 bg-gray-50 rounded text-center border border-gray-200 flex justify-center items-center min-h-[40px] group relative focus:outline-none focus:ring-2 focus:ring-red-500/20"
      data-block-id={block.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")) {
          onKeyDown && onKeyDown(e, block.id);
        }
      }}
    >
      <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
      <ContentEditable
        className="outline-none font-mono text-[16px] text-gray-800 empty:before:content-['E=mc^2'] empty:before:text-gray-400 min-w-[50px]"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
             e.preventDefault();
             onKeyDown && onKeyDown(e, block.id);
          }
        }}
        dataBlockId={`${block.id}-content`}
        dataAdvancedInput={true}
      />
    </div>
  );
}