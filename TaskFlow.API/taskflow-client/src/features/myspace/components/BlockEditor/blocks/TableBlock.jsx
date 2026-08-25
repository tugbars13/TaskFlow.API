import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function TableBlock({ block, updateBlock, onKeyDown }) {
  const rows = block.rows || [["", ""], ["", ""]];

  const updateCell = (rIndex, cIndex, val) => {
    const newRows = rows.map(r => [...r]);
    newRows[rIndex][cIndex] = val;
    updateBlock(block.id, { rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(rows[0].length).fill("");
    updateBlock(block.id, { rows: [...rows, newRow] });
  };

  const addCol = () => {
    const newRows = rows.map(r => [...r, ""]);
    updateBlock(block.id, { rows: newRows });
  };

  return (
    <div className="my-4 overflow-x-auto relative group" onKeyDown={(e) => { if(e.key === "Backspace" && !e.target.innerText) onKeyDown(e, block.id); }}>
      <table className="w-full text-left border-collapse border border-gray-200 rounded text-[13px]">
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-gray-200 last:border-0">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="border-r border-gray-200 last:border-0 p-2 min-w-[100px]">
                  <ContentEditable
                    className="outline-none min-h-[20px] empty:before:content-['...'] empty:before:text-gray-300"
                    value={cell}
                    onChange={(val) => updateCell(rIdx, cIdx, val)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" contentEditable={false}>
        <button onClick={addRow} className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">add</span> Satır Ekle</button>
        <button onClick={addCol} className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">add</span> Kolon Ekle</button>
      </div>
    </div>
  );
}