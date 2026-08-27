import React from "react";
import { ContentEditable } from "./ContentEditable";
import BlockMenu from "./BlockMenu";

export default function EmbedBlock({ block, updateBlock, onKeyDown, removeBlock, duplicateBlock, isMenuVisible, setMenuOpen }) {
  const getEmbedInfo = (rawUrl) => {
    if (!rawUrl) return { isSupported: false, isValid: false, url: "", provider: null };
    let url = rawUrl.trim();
    
    // Auto-prepend https if it looks like a domain but lacks protocol
    if (!url.startsWith("http") && url.includes(".")) {
      url = "https://" + url;
    }
    
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return { isSupported: false, isValid: false, url: rawUrl, provider: null };
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    // YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      let videoId = null;
      if (hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.slice(1);
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2]; 
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/")[2];
      } else if (parsedUrl.pathname.startsWith("/live/")) {
        videoId = parsedUrl.pathname.split("/")[2];
      } else if (parsedUrl.searchParams.has("v")) {
        videoId = parsedUrl.searchParams.get("v");
      }
      
      if (videoId) {
         videoId = videoId.split('?')[0].split('#')[0].split('&')[0];
         return { isSupported: true, isValid: true, url: `https://www.youtube.com/embed/${videoId}`, provider: 'YouTube' };
      }
    }
    
    // Vimeo
    if (hostname.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (match && match[1]) {
        return { isSupported: true, isValid: true, url: `https://player.vimeo.com/video/${match[1]}`, provider: 'Vimeo' };
      }
    }

    // Spotify
    if (hostname.includes("spotify.com")) {
       if (parsedUrl.pathname.startsWith("/embed/")) {
         return { isSupported: true, isValid: true, url: url, provider: 'Spotify' };
       }
       const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
       if (pathParts.length >= 2) {
         return { isSupported: true, isValid: true, url: `https://open.spotify.com/embed/${pathParts[0]}/${pathParts[1]}`, provider: 'Spotify' };
       }
    }

    // Figma
    if (hostname.includes("figma.com")) {
       return { isSupported: true, isValid: true, url: `https://www.figma.com/embed?embed_host=taskflow&url=${encodeURIComponent(url)}`, provider: 'Figma' };
    }

    // Google Maps
    if (hostname.includes("google.com") && parsedUrl.pathname.startsWith("/maps/embed")) {
       return { isSupported: true, isValid: true, url: url, provider: 'Google Maps' };
    }

    // Generic Unsupported Valid URL
    return { isSupported: false, isValid: true, url: url, provider: hostname.replace('www.', '') };
  };

  const embedInfo = getEmbedInfo(block.url);
  const showInput = !block.url || !embedInfo.isValid;

  const handleKeyDown = (e) => {
    // Stop enter and slash from bubbling when typing in the input
    if (e.key === "Enter" || e.key === "/") {
      e.stopPropagation();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Allow BlockEditor to process enter specifically for block creation if needed
      onKeyDown && onKeyDown(e, block.id);
    }
  };

  const handleWrapperKeyDown = (e) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete")) {
      onKeyDown && onKeyDown(e, block.id);
    }
  };

  return (
    <div 
      className="my-4 group relative focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded-lg" 
      data-block-id={block.id}
      tabIndex={0}
      onKeyDown={handleWrapperKeyDown}
    >
      <BlockMenu onRemove={() => removeBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} visible={isMenuVisible} onOpenChange={setMenuOpen} />
      {showInput ? (
        <div className="w-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md flex items-center gap-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
          <span className="material-symbols-outlined text-gray-400">integration_instructions</span>
          <ContentEditable
            className="flex-1 text-[13px] text-gray-800 outline-none empty:before:content-['Embed_URL_girin_(Örn:_YouTube)...'] empty:before:text-gray-400"
            value={block.url || ""}
            onChange={(val) => {
              updateBlock(block.id, { url: val });
            }}
            onKeyDown={handleKeyDown}
            dataBlockId={`${block.id}-url`}
            dataField="url"
            dataAdvancedInput={true}
          />
        </div>
      ) : embedInfo.isSupported ? (
        <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100" contentEditable={false}>
          <iframe 
            src={embedInfo.url} 
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            title={`${embedInfo.provider} Embed`}
          ></iframe>
        </div>
      ) : (
        <div className="w-full p-5 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2" contentEditable={false}>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-1">
            <span className="material-symbols-outlined">link_off</span>
          </div>
          <span className="text-[14px] font-medium text-gray-800 text-center">
            Bu içerik gömülü olarak görüntülenemiyor
          </span>
          <span className="text-[12px] text-gray-500 text-center mb-2">
            ({embedInfo.provider}) güvenlik ilkeleri gereği iframe gösterimine izin vermiyor.
          </span>
          <a 
            href={embedInfo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center gap-2"
          >
            <span>Bağlantıyı Aç</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        </div>
      )}
    </div>
  );
}