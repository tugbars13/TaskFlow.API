import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function TextBlock({ block, updateBlock, onKeyDown, placeholder, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen, onChangeType, currentType }) {
  return (
    <div className="group relative">
      <BlockMenu 
        onRemove={() => removeBlock(block.id)} 
        onDuplicate={() => duplicateBlock(block.id)} 
        visible={isMenuVisible} 
        onOpenChange={setMenuOpen} 
        onChangeType={onChangeType}
        currentType={currentType || block.type}
      />
      <ContentEditable
        className="w-full min-h-[24px] text-[15px] text-gray-800 outline-none leading-relaxed empty:before:content-[attr(placeholder)] empty:before:text-gray-300 whitespace-pre-wrap break-words"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        placeholder={placeholder}
        dataBlockId={block.id}
        isRichText={true}
      />
    </div>
  );
}