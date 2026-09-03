import { useState, useRef } from "react";
import { uploadFile, uploadImage } from "@/api/uploadService";
import { checkUrlValidity } from "@/utils/urlUtils";

export default function useUpload({ type, onUploadSuccess }) {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUrlSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (checkUrlValidity(urlInput)) {
      setUrlError("");
      let finalUrl = urlInput.trim();
      if (!/^(https?):/i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      onUploadSuccess({ url: finalUrl, source: "url" });
    } else {
      setUrlError(type === 'image' ? "Geçerli bir görsel URL'si girin." : "Geçerli bir dosya URL'si girin.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      if (!file.type.startsWith("image/")) {
        setUrlError("Lütfen geçerli bir görsel seçin.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUrlError("Görsel 5MB'dan küçük olmalıdır.");
        return;
      }
    } else {
      if (file.size > 25 * 1024 * 1024) {
        setUrlError("Dosya 25MB'dan küçük olmalıdır.");
        return;
      }
    }

    setUrlError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const responseData = type === 'image'
        ? await uploadImage(formData)
        : await uploadFile(formData);

      if (responseData && responseData.url) {
        onUploadSuccess({
          url: responseData.url,
          source: "upload",
          name: responseData.name || file.name,
          size: responseData.size || file.size
        });
      } else {
        setUrlError("Yükleme başarısız oldu.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUrlError(type === 'image' ? "Görsel yüklenirken bir hata oluştu." : "Dosya yüklenirken bir hata oluştu veya format desteklenmiyor.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const resetUploadState = () => {
    setUrlInput("");
    setUrlError("");
  };

  return {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isUploading,
    fileInputRef,
    handleUrlSubmit,
    handleFileUpload,
    resetUploadState
  };
}
