import React from "react";
import BlockMenu from "./BlockMenu";

export default function DividerBlock({ block, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  return (
    <div 
      className="py-3 w-full group relative focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded cursor-pointer" 
      contentEditable={false} 
      data-block-id={block.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")) {
          onKeyDown && onKeyDown(e, block.id);
        }
      }}
    >
      <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
      <hr className="border-gray-200 pointer-events-none" />
    </div>
  );
}
