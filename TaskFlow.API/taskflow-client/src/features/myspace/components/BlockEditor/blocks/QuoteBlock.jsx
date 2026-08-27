import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function QuoteBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen, onChangeType, currentType }) {
  return (
    <div className="border-l-4 border-gray-300 pl-4 py-1 my-2 group relative">
      <BlockMenu 
        onRemove={() => removeBlock(block.id)} 
        onDuplicate={() => duplicateBlock(block.id)} 
        visible={isMenuVisible} 
        onOpenChange={setMenuOpen} 
        onChangeType={onChangeType}
        currentType={currentType || block.type}
      />
      <ContentEditable
        className="w-full outline-none text-[16px] italic text-gray-700 min-h-[24px] empty:before:content-['Alıntı...'] empty:before:text-gray-300"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
        isRichText={true}
      />
    </div>
  );
}