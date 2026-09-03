import React, { useState } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { createShare } from "../api/mySpaceService";

export default function ShareModal({ isOpen, onClose, pageId }) {
  const [permission, setPermission] = useState("View");
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    setIsLoading(true);
    setError("");
    setShareLink("");
    setCopied(false);
    try {
      const response = await createShare(pageId, permission);
      if (response.data?.success) {
        const token = response.data.data.token;
        const link = `${window.location.origin}/myspace/share/${token}`;
        setShareLink(link);
      } else {
        setError("Link oluşturulamadı.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareLink("");
    setError("");
    setPermission("View");
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sayfayı Paylaş"
      size="md"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Bu sayfayı başkalarıyla paylaşmak için bir bağlantı oluşturun.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="permission"
                value="View"
                checked={permission === "View"}
                onChange={(e) => setPermission(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">Görüntüleme</span>
                  <Badge variant="info">Okuma</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Bağlantıya sahip herkes sayfayı görebilir.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="permission"
                value="Edit"
                checked={permission === "Edit"}
                onChange={(e) => setPermission(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">Düzenleme</span>
                  <Badge variant="warning">Yazma</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Sisteme giriş yapmış kişiler sayfayı düzenleyebilir.</p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        {shareLink ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Paylaşım Bağlantısı</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onClick={(e) => e.target.select()}
              />
              <Button
                variant={copied ? "primary" : "secondary"}
                onClick={handleCopy}
                className="whitespace-nowrap"
              >
                {copied ? "Kopyalandı!" : "Kopyala"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            onClick={handleCreateLink}
          >
            Bağlantı Oluştur
          </Button>
        )}
      </div>
    </Modal>
  );
}
