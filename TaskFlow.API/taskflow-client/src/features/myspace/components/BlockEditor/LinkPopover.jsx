import React, { useState, useRef, useEffect } from "react";

export default function LinkPopover({
  initialUrl = "",
  hasExistingLink = false,
  position = { x: 0, y: 0, showAbove: false },
  onApply,
  onUnlink,
  onClose,
}) {
  const [url, setUrl] = useState(initialUrl || "");
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus and select URL input on open
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onApply(url);
  };

  const popoverStyle = {
    left: `${position.x}px`,
    top: position.showAbove ? "auto" : `${position.y}px`,
    bottom: position.showAbove ? `${window.innerHeight - position.y}px` : "auto",
  };

  return (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-100"
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-md focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-gray-50/50">
          <span className="material-symbols-outlined text-[16px] text-gray-400 shrink-0">
            link
          </span>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ornek.com..."
            className="w-full text-[13px] bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            {(hasExistingLink || initialUrl) && (
              <button
                type="button"
                onClick={onUnlink}
                className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded font-medium flex items-center gap-1 transition-colors"
                title="Bağlantıyı kaldır"
              >
                <span className="material-symbols-outlined text-[14px]">
                  link_off
                </span>
                <span>Bağlantıyı Kaldır</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-[12px] text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-[12px] bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-sm transition-colors"
            >
              Uygula
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
