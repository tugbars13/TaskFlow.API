import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function ListBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen, onChangeType, currentType }) {
  return (
    <li className="my-0.5 text-gray-900 group relative">
      <BlockMenu 
        onRemove={() => removeBlock(block.id)} 
        onDuplicate={() => duplicateBlock(block.id)} 
        visible={isMenuVisible} 
        onOpenChange={setMenuOpen} 
        onChangeType={onChangeType}
        currentType={currentType || block.type}
      />
      <ContentEditable
        className="text-[15px] outline-none min-h-[24px] text-gray-800 empty:before:content-['Liste_öğesi...'] empty:before:text-gray-300 inline-block w-full align-top"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
        isRichText={true}
      />
    </li>
  );
}