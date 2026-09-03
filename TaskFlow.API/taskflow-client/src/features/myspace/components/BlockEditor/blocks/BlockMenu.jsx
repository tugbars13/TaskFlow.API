import React, { useState, useRef, useEffect } from 'react';
import { BLOCK_TYPES } from '../blockTypes';
import { useEditorContext } from '../EditorContext';

const CONVERT_OPTIONS = [
  { type: BLOCK_TYPES.TEXT, label: "Text", icon: "short_text" },
  { type: BLOCK_TYPES.HEADING_1, label: "Heading 1", icon: "format_h1" },
  { type: BLOCK_TYPES.HEADING_2, label: "Heading 2", icon: "format_h2" },
  { type: BLOCK_TYPES.HEADING_3, label: "Heading 3", icon: "format_h3" },
  { type: BLOCK_TYPES.BULLET_LIST, label: "Bullet List", icon: "format_list_bulleted" },
  { type: BLOCK_TYPES.NUMBERED_LIST, label: "Numbered List", icon: "format_list_numbered" },
  { type: BLOCK_TYPES.TODO, label: "Todo", icon: "check_box" },
  { type: BLOCK_TYPES.QUOTE, label: "Quote", icon: "format_quote" },
  { type: BLOCK_TYPES.CALLOUT, label: "Callout", icon: "lightbulb" },
  { type: BLOCK_TYPES.CODE, label: "Code", icon: "code" },
  { type: BLOCK_TYPES.TOGGLE, label: "Toggle", icon: "arrow_drop_down_circle" },
];

export default function BlockMenu({ onRemove, onDuplicate, visible, onOpenChange, onChangeType, currentType }) {
  const { readOnly } = useEditorContext();
  const [show, setShow] = useState(false);
  const [showTypeSubmenu, setShowTypeSubmenu] = useState(false);
  const [selectedSubmenuIndex, setSelectedSubmenuIndex] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShow(false);
        setShowTypeSubmenu(false);
        if (onOpenChange) onOpenChange(false);
      }
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (showTypeSubmenu) {
          setShowTypeSubmenu(false);
        } else {
          setShow(false);
          if (onOpenChange) onOpenChange(false);
        }
        return;
      }

      if (showTypeSubmenu) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedSubmenuIndex((prev) => (prev + 1) % CONVERT_OPTIONS.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedSubmenuIndex((prev) => (prev - 1 + CONVERT_OPTIONS.length) % CONVERT_OPTIONS.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          handleSelectType(CONVERT_OPTIONS[selectedSubmenuIndex].type);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          setShowTypeSubmenu(false);
        }
      }
    };

    if (show) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, showTypeSubmenu, selectedSubmenuIndex, onOpenChange]);

  const handleSelectType = (newType) => {
    if (onChangeType) {
      onChangeType(newType);
    }
    setShow(false);
    setShowTypeSubmenu(false);
    if (onOpenChange) onOpenChange(false);
  };

  const handleCopy = () => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
    }
    setShow(false);
    setShowTypeSubmenu(false);
    if (onOpenChange) onOpenChange(false);
  };

  const handleRemove = () => {
    setShow(false);
    setShowTypeSubmenu(false);
    if (onOpenChange) onOpenChange(false);
    if (onRemove) onRemove();
  };

  const isVisible = visible || show;
  if (!isVisible || readOnly) return null;

  return (
    <div className="absolute top-2 right-2 z-10" ref={menuRef} contentEditable={false}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const nextShow = !show;
          setShow(nextShow);
          if (!nextShow) setShowTypeSubmenu(false);
          if (onOpenChange) onOpenChange(nextShow);
        }}
        className="p-1 rounded bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Seçenekler"
      >
        <span className="material-symbols-outlined text-[16px]">more_vert</span>
      </button>
      {show && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
          {onChangeType && (
            <div 
              className="relative"
              onMouseEnter={() => {
                const idx = CONVERT_OPTIONS.findIndex((o) => o.type === currentType);
                setSelectedSubmenuIndex(idx >= 0 ? idx : 0);
                setShowTypeSubmenu(true);
              }}
              onMouseLeave={() => setShowTypeSubmenu(false)}
            >
              <button
                className="w-full px-3 py-1.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTypeSubmenu(!showTypeSubmenu);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-gray-500">transform</span>
                  <span>Türünü Değiştir</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-gray-400">chevron_right</span>
              </button>

              {showTypeSubmenu && (
                <div 
                  className="absolute right-full top-0 mr-1 w-44 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 max-h-64 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                    Dönüştür
                  </div>
                  {CONVERT_OPTIONS.map((opt, index) => {
                    const isSelected = index === selectedSubmenuIndex;
                    const isCurrent = opt.type === currentType;
                    return (
                      <button
                        key={opt.type}
                        className={`w-full px-3 py-1.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                          isSelected ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => setSelectedSubmenuIndex(index)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectType(opt.type);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-red-600" : "text-gray-400"}`}>
                            {opt.icon}
                          </span>
                          <span>{opt.label}</span>
                        </div>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-[14px] text-red-500">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {onChangeType && <div className="h-px bg-gray-100 my-1 w-full" />}

          <button 
            className="w-full px-3 py-1.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          >
            <span className="material-symbols-outlined text-[16px] text-gray-500">content_copy</span>
            <span>Kopyala</span>
          </button>
          <div className="h-px bg-gray-100 my-1 w-full"></div>
          <button 
            className="w-full px-3 py-1.5 text-left text-[13px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Sil</span>
          </button>
        </div>
      )}
    </div>
  );
}
