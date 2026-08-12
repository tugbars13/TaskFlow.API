import { useState } from "react";
import { cn } from "@/utils/cn";

export default function NotificationCard({
  notification,
  onAcceptInvite,
  onRejectInvite,
  onMarkAsRead,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const isTeamInvite = notification.type === "TeamInvitation";
  const canInteract = isTeamInvite && !notification.isRead;

  const handleAccept = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onAcceptInvite(notification.id, notification.relatedId);
    } catch (err) {
      if (err.response?.status === 404) {
        onMarkAsRead(notification.id);
        alert("Bu tak\u0131m daveti art\u0131k ge\u00e7erli de\u011fil.");
      }
      console.error(err);
      setIsProcessing(false); // only revert if it failed
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onRejectInvite(notification.id, notification.relatedId);
    } catch (err) {
      if (err.response?.status === 404) {
        onMarkAsRead(notification.id);
        alert("Bu tak\u0131m daveti art\u0131k ge\u00e7erli de\u011fil.");
      }
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleCardClick = () => {
    if (!notification.isRead && !isTeamInvite) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "p-md rounded-xl border transition-all duration-200",
        notification.isRead
          ? "bg-surface border-outline-variant/30 opacity-70"
          : "bg-primary/5 border-primary/20",
        !notification.isRead && !isTeamInvite && "cursor-pointer hover:bg-primary/10"
      )}
    >
      <div className="flex items-start justify-between gap-sm">
        <h4 className="text-[14px] font-bold text-on-surface">
          {notification.title}
        </h4>
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
        )}
      </div>

      <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
        {notification.message}
      </p>

      {canInteract && (
        <div className="flex items-center gap-sm mt-md">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 py-1.5 px-3 bg-primary text-on-primary text-[12px] font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "İşleniyor..." : "Kabul Et"}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 py-1.5 px-3 bg-surface-container-high text-on-surface text-[12px] font-semibold rounded-lg hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "İşleniyor..." : "Reddet"}
          </button>
        </div>
      )}

      <div className="text-[11px] text-outline mt-sm text-right">
        {new Date(notification.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
