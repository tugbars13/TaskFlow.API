import React, { useState } from "react";
import useUpload from "../../../hooks/useUpload";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function ImageBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "url"

  const handleUploadSuccess = (data) => {
    updateBlock(block.id, { url: data.url, source: data.source });
  };

  const {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isUploading,
    fileInputRef,
    handleUrlSubmit,
    handleFileUpload,
    resetUploadState
  } = useUpload({ type: 'image', onUploadSuccess: handleUploadSuccess });

  const removeImage = (e) => {
    e.stopPropagation();
    updateBlock(block.id, { url: "", source: "" });
    resetUploadState();
  };

  // BlockEditor's global event interception
  const stopPropagation = (e) => {
    if (e.key === "Enter" || e.key === "/") {
      e.stopPropagation();
    }
  };

  if (block.url) {
    return (
      <div 
        className="my-4 group relative flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded-md"
        data-block-id={block.id}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")) {
            onKeyDown && onKeyDown(e, block.id);
          }
        }}
      >
        <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
        <div className="relative inline-block w-full">
          <img 
            src={block.url} 
            alt="Image" 
            className="max-w-full rounded-md border border-gray-200 object-contain mx-auto" 
            contentEditable={false}
          />
        </div>
        {/* Caption allows focusing and pressing Enter */}
        <div className="w-full mt-2 px-4" onClick={(e) => e.stopPropagation()}>
          <ContentEditable
            className="text-[13px] text-gray-500 outline-none text-center empty:before:content-['Görsel_için_açıklama_yazın...'] w-full"
            value={block.content}
            onChange={(val) => updateBlock(block.id, { content: val })}
            onKeyDown={(e) => {
              if (onKeyDown) onKeyDown(e, block.id);
            }}
            dataBlockId={`${block.id}-caption`}
            dataField="content"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="my-4 w-full border border-gray-200 rounded-md bg-gray-50 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/20 group relative" 
      data-block-id={block.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")) {
          onKeyDown && onKeyDown(e, block.id);
        }
      }}
    >
      <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-[13px] font-medium text-center ${activeTab === "upload" ? "bg-white text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:bg-gray-100"}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab("upload"); setUrlError(""); }}
        >
          Görsel Yükle
        </button>
        <button
          className={`flex-1 py-2 text-[13px] font-medium text-center ${activeTab === "url" ? "bg-white text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:bg-gray-100"}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab("url"); setUrlError(""); }}
        >
          URL ile Ekle
        </button>
      </div>

      <div className="p-4" onClick={(e) => e.stopPropagation()} onKeyDown={stopPropagation}>
        {activeTab === "upload" && (
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-md bg-white">
            <span className="material-symbols-outlined text-[32px] text-gray-400 mb-2">cloud_upload</span>
            <span className="text-[13px] text-gray-600 mb-4">
              {isUploading ? "Yükleniyor..." : "Bilgisayarınızdan bir görsel seçin"}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium rounded-md disabled:opacity-50"
            >
              Dosya Seç
            </button>
          </div>
        )}

        {activeTab === "url" && (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-md border border-gray-200">
            <label className="text-[13px] text-gray-700 font-medium">Görsel URL'si</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:border-red-500"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUrlSubmit(e);
                  }
                }}
              />
              <button 
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium rounded-md"
              >
                Ekle
              </button>
            </div>
          </div>
        )}

        {urlError && (
          <div className="mt-3 text-[12px] text-red-500 font-medium text-center">
            {urlError}
          </div>
        )}
      </div>
    </div>
  );
}