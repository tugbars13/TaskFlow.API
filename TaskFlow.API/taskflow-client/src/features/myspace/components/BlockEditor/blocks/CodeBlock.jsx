import React from "react";
export default function CodeBlock({ block, updateBlock, onKeyDown }) {
  return (
    <div className="my-3 rounded-md bg-gray-50 border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-3 py-1 text-[11px] text-gray-500 font-medium font-mono border-b border-gray-200 flex justify-between">
        <span>{block.language || "javascript"}</span>
      </div>
      <textarea
        className="w-full p-4 bg-transparent outline-none font-mono text-[13px] text-gray-800 resize-none min-h-[100px]"
        value={block.content || ""}
        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && e.target.value === "") onKeyDown(e, block.id);
        }}
        placeholder="Kodunuzu buraya yazın..."
        data-block-id={block.id}
      />
    </div>
  );
}
