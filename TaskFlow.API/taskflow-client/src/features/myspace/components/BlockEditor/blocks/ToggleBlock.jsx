import React from "react";
import { ContentEditable } from "./ContentEditable";

export default function ToggleBlock({ block, updateBlock, onKeyDown, renderBlocks }) {
  const isOpen = block.isOpen !== undefined ? block.isOpen : false;
  const children = block.children || [];

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    updateBlock(block.id, { isOpen: !isOpen });
  };

  const handleAddChild = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const newBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: "text",
      content: "",
    };
    const newChildren = [...children, newBlock];
    updateBlock(block.id, {
      children: newChildren,
      isOpen: true,
    });
    setTimeout(() => {
      const el =
        document.querySelector(`[data-block-id="${newBlock.id}-content"]`) ||
        document.querySelector(`[data-block-id="${newBlock.id}"]`);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  return (
    <div className="w-full my-1.5 group/toggle">
      <div className="flex items-start gap-1">
        <button
          type="button"
          contentEditable={false}
          onClick={handleToggle}
          className="mt-0.5 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors shrink-0 select-none cursor-pointer"
          title={isOpen ? "Kapat" : "Aç"}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            arrow_right
          </span>
        </button>
        <ContentEditable
          className="flex-1 outline-none text-[15px] font-semibold text-gray-800 min-h-[26px] leading-relaxed empty:before:content-[attr(placeholder)] empty:before:text-gray-300 whitespace-pre-wrap break-words"
          value={block.content}
          onChange={(val) => updateBlock(block.id, { content: val })}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          placeholder="Açılır başlık..."
          dataBlockId={block.id}
          isRichText={true}
        />
      </div>

      {isOpen && (
        <div className="pl-6 mt-1 ml-[11px] border-l-2 border-gray-200/80 space-y-1">
          {children.length > 0 ? (
            <>
              {renderBlocks && renderBlocks(children, block.id)}
              <div className="pt-0.5" contentEditable={false}>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="opacity-0 group-hover/toggle:opacity-100 text-[12px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-0.5 rounded transition-all flex items-center gap-1 select-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Blok ekle</span>
                </button>
              </div>
            </>
          ) : (
            <div
              contentEditable={false}
              onClick={handleAddChild}
              className="py-1 px-2 text-[13px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-1.5 transition-colors select-none"
            >
              <span className="material-symbols-outlined text-[15px] text-gray-300">add</span>
              <span>Boş toggle. Yazmak veya blok eklemek için tıklayın</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}