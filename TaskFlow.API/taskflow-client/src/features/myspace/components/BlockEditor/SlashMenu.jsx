import React, { useEffect, useRef } from "react";
import { SLASH_COMMANDS } from "./slashCommands";

export default function SlashMenu({ query, onSelect, onClose, position }) {
  const menuRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.keywords.some(k => k.includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  if (filteredCommands.length === 0) return null;

  let globalIndex = 0;

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-lg w-72 max-h-80 overflow-y-auto text-gray-800"
      style={{ top: position.y, left: position.x }}
    >
      {Object.keys(grouped).map(cat => (
        <div key={cat}>
          <div className="text-[11px] font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider bg-gray-50/80 sticky top-0">
            {cat}
          </div>
          {grouped[cat].map(cmd => {
            const currentIndex = globalIndex++;
            return (
              <button
                key={cmd.type}
                className={"w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors " + (selectedIndex === currentIndex ? "bg-gray-100" : "")}
                onMouseEnter={() => setSelectedIndex(currentIndex)}
                onClick={() => onSelect(cmd.type)}
              >
                <div className="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-gray-600" style={{ fontVariationSettings: "'FILL' 1" }}>{cmd.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">{cmd.label}</div>
                  <div className="text-[11px] text-gray-500 truncate">{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
