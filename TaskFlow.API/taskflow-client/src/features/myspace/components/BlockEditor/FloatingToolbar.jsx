import React from "react";

export default function FloatingToolbar({
  show,
  position = { x: 0, y: 0 },
  activeFormats = { isBold: false, isItalic: false, isUnderline: false, isLink: false },
  onFormat,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="fixed z-50 flex items-center gap-0.5 bg-[#1f2328] text-white rounded-lg shadow-xl px-1 py-0.5 border border-gray-700/80 animate-in fade-in zoom-in-95 duration-100 select-none pointer-events-auto"
      contentEditable={false}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Bold Button */}
      <button
        type="button"
        title="Kalın (Ctrl+B)"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => onFormat("bold")}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
          activeFormats.isBold
            ? "bg-white/25 text-white font-black ring-1 ring-white/30"
            : "text-gray-300 hover:text-white hover:bg-white/10 font-bold"
        }`}
      >
        <span className="text-[13px]">B</span>
      </button>

      {/* Italic Button */}
      <button
        type="button"
        title="İtalik (Ctrl+I)"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => onFormat("italic")}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
          activeFormats.isItalic
            ? "bg-white/25 text-white font-bold ring-1 ring-white/30"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className="italic font-serif text-[14px]">I</span>
      </button>

      {/* Underline Button */}
      <button
        type="button"
        title="Altı Çizili (Ctrl+U)"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => onFormat("underline")}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
          activeFormats.isUnderline
            ? "bg-white/25 text-white font-bold ring-1 ring-white/30"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className="underline text-[13px]">U</span>
      </button>

      <div className="w-px h-3.5 bg-gray-700 mx-0.5" />

      {/* Link Button */}
      <button
        type="button"
        title="Bağlantı (Ctrl+K)"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => onFormat("link")}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
          activeFormats.isLink
            ? "bg-white/25 text-white ring-1 ring-white/30"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">link</span>
      </button>
    </div>
  );
}
