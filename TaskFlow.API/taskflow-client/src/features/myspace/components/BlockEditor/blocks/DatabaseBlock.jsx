import React from "react";
export default function DatabaseBlock({ block, onKeyDown }) {
  // Demo statik database
  return (
    <div className="my-4 border border-gray-200 rounded-lg overflow-hidden" contentEditable={false} tabIndex={0} onKeyDown={(e) => onKeyDown(e, block.id)}>
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-500 text-[18px]">database</span>
        <span className="text-[13px] font-medium text-gray-700">TaskFlow Tasks</span>
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-2 font-medium text-gray-500 w-1/2">Görev</th>
            <th className="p-2 font-medium text-gray-500">Durum</th>
            <th className="p-2 font-medium text-gray-500">Öncelik</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="p-2">Auth modülünü tamamla</td>
            <td className="p-2"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px]">In Progress</span></td>
            <td className="p-2">High</td>
          </tr>
          <tr>
            <td className="p-2">Sayfa düzenleyici eklentisi</td>
            <td className="p-2"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">To Do</span></td>
            <td className="p-2">Medium</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
