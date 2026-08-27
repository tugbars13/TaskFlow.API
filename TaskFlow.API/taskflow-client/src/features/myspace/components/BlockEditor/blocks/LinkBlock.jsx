import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function LinkBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  const checkUrlValidity = (url) => {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed) return false;

    let testUrl = trimmed;
    if (!/^(https?|mailto|tel|sms):/i.test(trimmed)) {
      testUrl = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:" || parsed.protocol === "tel:" || parsed.protocol === "sms:";
    } catch (err) {
      return false;
    }
  };

  const getSafeUrl = (url) => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (!trimmed) return "#";
    if (!/^(https?|mailto|tel|sms):/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const isValid = checkUrlValidity(block.url);
  const safeUrl = isValid ? getSafeUrl(block.url) : "#";
  const hasInput = block.url && block.url.trim() !== "";

  return (
    <div 
      className="my-2 group relative focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded p-1"
      data-block-id={block.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")) {
          onKeyDown && onKeyDown(e, block.id);
        }
      }}
    >
      <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
      <a 
        href={safeUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        contentEditable={false} 
        className={`inline-flex items-center gap-1 mb-1 ${
          isValid ? "text-indigo-600 hover:underline cursor-pointer" : "text-gray-400 cursor-not-allowed pointer-events-none"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isValid) {
            e.preventDefault();
          }
        }}
      >
        <span className="material-symbols-outlined text-[16px]">link</span>
        {block.content || "Bağlantı"}
      </a>
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-1 pl-5">
        <ContentEditable
          className="text-[13px] text-gray-700 outline-none empty:before:content-['Bağlantı_metni_girin...']"
          value={block.content}
          onChange={(val) => updateBlock(block.id, { content: val })}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          dataBlockId={`${block.id}-content`}
          dataField="content"
          dataAdvancedInput={true}
        />
        <ContentEditable
          className="text-[12px] text-gray-400 outline-none empty:before:content-['URL_girin...']"
          value={block.url}
          onChange={(val) => updateBlock(block.id, { url: val })}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          dataBlockId={`${block.id}-url`}
          dataField="url"
          dataAdvancedInput={true}
        />
        {hasInput && !isValid && (
          <div className="text-[11px] text-red-500 font-medium">
            Geçerli bir URL girin.
          </div>
        )}
      </div>
    </div>
  );
}