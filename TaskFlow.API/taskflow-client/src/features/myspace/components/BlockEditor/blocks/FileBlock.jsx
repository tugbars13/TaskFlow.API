import React, { useState, useRef } from "react";
import api from "@/api/client/axios";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function FileBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "url"
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const checkUrlValidity = (url) => {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    
    let testUrl = trimmed;
    if (!/^(https?):/i.test(trimmed)) {
      testUrl = `https://${trimmed}`;
    }
    
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (checkUrlValidity(urlInput)) {
      setUrlError("");
      let finalUrl = urlInput.trim();
      if (!/^(https?):/i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      
      // Default name to the last segment of URL if possible
      let defaultName = "Bağlantıdan Dosya";
      try {
        const parsed = new URL(finalUrl);
        const path = parsed.pathname;
        const segments = path.split("/").filter(Boolean);
        if (segments.length > 0) {
          defaultName = segments[segments.length - 1];
        }
      } catch (err) {}
      
      updateBlock(block.id, { 
        url: finalUrl, 
        source: "url",
        content: defaultName,
        size: "Bilinmiyor"
      });
    } else {
      setUrlError("Geçerli bir dosya URL'si girin.");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 25 * 1024 * 1024) {
      setUrlError("Dosya 25MB'dan küçük olmalıdır.");
      return;
    }

    setUrlError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.url) {
        updateBlock(block.id, { 
          url: response.data.url, 
          source: "upload",
          content: response.data.name || file.name,
          size: formatSize(response.data.size || file.size)
        });
      } else {
        setUrlError("Yükleme başarısız oldu.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUrlError("Dosya yüklenirken bir hata oluştu veya format desteklenmiyor.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    updateBlock(block.id, { url: "", source: "", content: "", size: "" });
    setUrlInput("");
    setUrlError("");
  };

  const stopPropagation = (e) => {
    if (e.key === "Enter" || e.key === "/") {
      e.stopPropagation();
    }
  };

  const openFile = () => {
    if (block.url) {
      window.open(block.url, "_blank", "noopener,noreferrer");
    }
  };

  if (block.url) {
    return (
      <div 
        tabIndex={0}
        className="flex items-center gap-3 my-3 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full sm:w-2/3 group relative focus:outline-none focus:ring-2 focus:ring-red-500/20" 
        data-block-id={block.id}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete")) {
            onKeyDown && onKeyDown(e, block.id);
          }
        }}
      >
        <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
        <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-600 shrink-0">
          <span className="material-symbols-outlined">description</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <ContentEditable
            className="text-[14px] font-medium text-gray-900 outline-none empty:before:content-['Dosya_Adı'] empty:before:text-gray-400 truncate"
            value={block.content || block.name} // fallback for legacy data
            onChange={(val) => updateBlock(block.id, { content: val })}
            onKeyDown={(e) => onKeyDown && onKeyDown(e, block.id)}
            dataBlockId={`${block.id}-content`}
            dataField="content"
            dataAdvancedInput={true}
          />
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500 truncate">
              {block.size || "Bilinmiyor"}
            </span>
            {block.source === "url" && (
              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                Linkten eklendi
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 mr-6">
          <button 
            onClick={openFile}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Aç / İndir"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      tabIndex={0}
      className="my-4 w-full sm:w-2/3 border border-gray-200 rounded-md bg-gray-50 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/20 group relative" 
      data-block-id={block.id}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete")) {
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
          Dosya Yükle
        </button>
        <button
          className={`flex-1 py-2 text-[13px] font-medium text-center ${activeTab === "url" ? "bg-white text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:bg-gray-100"}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab("url"); setUrlError(""); }}
        >
          Link ile Ekle
        </button>
      </div>

      <div className="p-4" onClick={(e) => e.stopPropagation()} onKeyDown={stopPropagation}>
        {activeTab === "upload" && (
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-md bg-white">
            <span className="material-symbols-outlined text-[32px] text-gray-400 mb-2">upload_file</span>
            <span className="text-[13px] text-gray-600 mb-4">
              {isUploading ? "Yükleniyor..." : "Bilgisayarınızdan bir dosya seçin"}
            </span>
            <input 
              type="file" 
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
            <label className="text-[13px] text-gray-700 font-medium">Dosya URL'si</label>
            <div className="flex gap-2">
              <input
                data-advanced-input="true"
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:border-red-500"
                placeholder="https://example.com/document.pdf"
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