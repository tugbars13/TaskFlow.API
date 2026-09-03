import React, { useRef, useState, useEffect } from "react";

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"
];

export default function FloatingToolbar({
  show,
  position = { x: 0, y: 0 },
  activeFormats = { isBold: false, isItalic: false, isUnderline: false, isLink: false, isStrike: false },
  blockType = "text",
  onFormat,
  onBlockTypeChange,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  // Close pickers on hide
  useEffect(() => {
    if (!show) {
      setShowColorPicker(false);
      setShowBgPicker(false);
    }
  }, [show]);

  if (!show) return null;

  const handleFormat = (e, format) => {
    e.preventDefault();
    e.stopPropagation();
    onFormat(format);
  };

  const handleBlockType = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    onBlockTypeChange(type);
  };

  const handleColor = (e, color) => {
    e.preventDefault();
    e.stopPropagation();
    onFormat("foreColor", color);
    setShowColorPicker(false);
  };

  const handleBg = (e, color) => {
    e.preventDefault();
    e.stopPropagation();
    onFormat("hiliteColor", color);
    setShowBgPicker(false);
  };

  const renderColorPicker = (onSelect) => (
    <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-lg border border-outline-variant/50 w-64 grid grid-cols-10 gap-1 z-50"
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
    >
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={(e) => onSelect(e, c)}
          className="w-4 h-4 rounded-sm border border-black/10 hover:scale-125 transition-transform"
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  );

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 flex flex-wrap items-center gap-0.5 bg-surface-bright text-on-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)] px-1.5 py-1 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-100 select-none pointer-events-auto"
      contentEditable={false}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Bold */}
      <button type="button" title="Bold (Ctrl+B)" onMouseDown={e => handleFormat(e, "bold")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          activeFormats.isBold ? "text-primary bg-primary/10 font-black" : "text-on-surface-variant hover:text-primary hover:bg-primary/5 font-bold"
        }`}>
        <span className="text-[13px]">B</span>
      </button>

      {/* Italic */}
      <button type="button" title="Italic (Ctrl+I)" onMouseDown={e => handleFormat(e, "italic")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          activeFormats.isItalic ? "text-primary bg-primary/10 font-bold" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="italic font-serif text-[14px]">I</span>
      </button>

      {/* Underline */}
      <button type="button" title="Underline (Ctrl+U)" onMouseDown={e => handleFormat(e, "underline")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          activeFormats.isUnderline ? "text-primary bg-primary/10 font-bold" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="underline text-[13px]">U</span>
      </button>
      
      {/* Strikethrough */}
      <button type="button" title="Strikethrough" onMouseDown={e => handleFormat(e, "strikeThrough")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          activeFormats.isStrike ? "text-primary bg-primary/10 font-bold" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="line-through text-[13px]">S</span>
      </button>

      <div className="w-px h-5 bg-outline-variant/50 mx-1" />

      {/* H1 */}
      <button type="button" title="Heading 1" onMouseDown={e => handleBlockType(e, "heading_1")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs font-bold ${
          blockType === "heading_1" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        H1
      </button>
      {/* H2 */}
      <button type="button" title="Heading 2" onMouseDown={e => handleBlockType(e, "heading_2")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs font-bold ${
          blockType === "heading_2" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        H2
      </button>
      {/* H3 */}
      <button type="button" title="Heading 3" onMouseDown={e => handleBlockType(e, "heading_3")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs font-bold ${
          blockType === "heading_3" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        H3
      </button>

      <div className="w-px h-5 bg-outline-variant/50 mx-1" />

      {/* Bullet List */}
      <button type="button" title="Bullet List" onMouseDown={e => handleBlockType(e, "bullet_list")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          blockType === "bullet_list" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
      </button>
      {/* Ordered List */}
      <button type="button" title="Numbered List" onMouseDown={e => handleBlockType(e, "numbered_list")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          blockType === "numbered_list" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
      </button>

      <div className="w-px h-5 bg-outline-variant/50 mx-1" />

      {/* Text Color */}
      <div className="relative">
        <button type="button" title="Text Color" onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowBgPicker(false); }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            showColorPicker ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
          }`}>
          <span className="material-symbols-outlined text-[18px]">format_color_text</span>
        </button>
        {showColorPicker && renderColorPicker(handleColor)}
      </div>

      {/* Highlight Color */}
      <div className="relative">
        <button type="button" title="Highlight Color" onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowBgPicker(!showBgPicker); setShowColorPicker(false); }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            showBgPicker ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
          }`}>
          <span className="material-symbols-outlined text-[18px]">format_color_fill</span>
        </button>
        {showBgPicker && renderColorPicker(handleBg)}
      </div>

      <div className="w-px h-5 bg-outline-variant/50 mx-1" />

      {/* Link */}
      <button type="button" title="Link (Ctrl+K)" onMouseDown={e => handleFormat(e, "link")}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          activeFormats.isLink ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`}>
        <span className="material-symbols-outlined text-[18px]">link</span>
      </button>

      {/* Clear Formatting */}
      <button type="button" title="Clear Formatting" onMouseDown={e => handleFormat(e, "removeFormat")}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-on-surface-variant hover:text-primary hover:bg-primary/5">
        <span className="material-symbols-outlined text-[18px]">format_clear</span>
      </button>
    </div>
  );
}
