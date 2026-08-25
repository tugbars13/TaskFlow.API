import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function ListBlock({ block, updateBlock, onKeyDown }) {
  return (
    <li className="my-0.5 text-gray-900">
      <ContentEditable
        className="text-[15px] outline-none min-h-[24px] text-gray-800 empty:before:content-['Liste_öğesi...'] empty:before:text-gray-300 inline-block w-full align-top"
        value={block.content}
        onChange={(val) => updateBlock(block.id, { content: val })}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        dataBlockId={block.id}
      />
    </li>
  );
}