import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function CalloutBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen, onChangeType, currentType }) {
  return (
    <div className="flex items-start gap-3 my-3 p-4 bg-gray-50 rounded-lg border border-gray-100 group relative">
      <BlockMenu 
        onRemove={() => removeBlock(block.id)} 
        onDuplicate={() => duplicateBlock(block.id)} 
        visible={isMenuVisible} 
        onOpenChange={setMenuOpen} 
        onChangeType={onChangeType}
        currentType={currentType || block.type}
      />
      <span className="text-[20px] select-none shrink-0">{block.icon || "💡"}</span>
      <ContentEditable
        className="flex-1 text-[14px] text-gray-800 outline-none min-h-[20px] empty:before:content-['Bilgi_veya_uyarı...'] empty:before:text-gray-400"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
        isRichText={true}
      />
    </div>
  );
}