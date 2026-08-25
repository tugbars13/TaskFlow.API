import React from "react";
export default function DividerBlock({ block, onKeyDown }) {
  return (
    <div className="py-3 w-full" contentEditable={false} onClick={(e) => e.target.focus()} tabIndex={0} onKeyDown={(e) => onKeyDown(e, block.id)} data-block-id={block.id}>
      <hr className="border-gray-200" />
    </div>
  );
}
