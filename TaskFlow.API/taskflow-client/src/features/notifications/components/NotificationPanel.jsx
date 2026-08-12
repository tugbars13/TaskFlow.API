import { cn } from "@/utils/cn";
import NotificationCard from "./NotificationCard";

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  loading,
  error,
  onMarkAsRead,
  onAcceptInvite,
  onRejectInvite,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div 
        className="fixed top-[72px] right-0 sm:right-md z-[110] w-full sm:w-[380px] h-[calc(100vh-72px)] sm:h-[calc(100vh-90px)] bg-surface-glass border-l sm:border sm:rounded-2xl border-outline-variant/30 shadow-xl flex flex-col backdrop-blur-3xl overflow-hidden animate-in slide-in-from-right-8"
      >
        <div className="flex items-center justify-between p-lg border-b border-outline-variant/20 bg-surface/50">
          <h2 className="text-[18px] font-bold text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">notifications</span>
            Bildirimler
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/5 text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-sm bg-surface-container-lowest/50">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-sm">progress_activity</span>
              Yükleniyor...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-error bg-error/10 rounded-xl text-sm font-medium">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-on-surface-variant">notifications_paused</span>
              </div>
              <p className="text-[14px] font-medium text-on-surface">Henüz bildiriminiz yok.</p>
              <p className="text-[12px] text-on-surface-variant mt-1">Yeni bir gelişme olduğunda burada görebilirsiniz.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onAcceptInvite={onAcceptInvite}
                onRejectInvite={onRejectInvite}
                onMarkAsRead={onMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
