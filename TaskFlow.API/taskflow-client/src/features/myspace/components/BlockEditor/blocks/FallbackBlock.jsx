import React from "react";
export default function FallbackBlock({ block, onKeyDown }) {
  return (
    <div 
      className="my-2 p-2 bg-red-50 text-red-600 border border-red-200 rounded text-[12px] flex items-center gap-2"
      contentEditable={false}
      tabIndex={0}
      onKeyDown={(e) => onKeyDown(e, block.id)}
    >
      <span className="material-symbols-outlined text-[16px]">warning</span>
      <span>Bu blok türü ("{block.type}") desteklenmiyor.</span>
    </div>
  );
}
