import React from "react";
import { ContentEditable } from "./ContentEditable";
export default function EmbedBlock({ block, updateBlock, onKeyDown }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    return url;
  };

  const embedUrl = getEmbedUrl(block.url);

  return (
    <div className="my-4">
      {embedUrl ? (
        <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden border border-gray-200" contentEditable={false}>
          <iframe 
            src={embedUrl} 
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="w-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400">integration_instructions</span>
          <ContentEditable
            className="flex-1 text-[13px] text-gray-800 outline-none empty:before:content-['Embed_URL_girin_(Örn:_YouTube)...'] empty:before:text-gray-400"
            value={block.url}
            onChange={(val) => updateBlock(block.id, { url: val })}
            onKeyDown={(e) => onKeyDown(e, block.id)}
            dataBlockId={block.id}
          />
        </div>
      )}
    </div>
  );
}