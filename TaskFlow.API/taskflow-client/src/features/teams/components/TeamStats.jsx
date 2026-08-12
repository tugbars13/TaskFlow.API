import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import useNotifications from "@/features/notifications/hooks/useNotifications";

export default function TeamStats({ stats }) {
  const { totalMembers = 5, activeNow = 4 } = stats || {};
  const { unreadCount } = useNotifications(null);

  const handleOpenNotifications = () => {
    window.dispatchEvent(new CustomEvent("openNotifications"));
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
      <StatCard
        icon="groups"
        iconClassName="text-primary bg-primary/10"
        label="Total Members"
        value={String(totalMembers)}
        delta="Workspace limit: 20"
        deltaClassName="text-on-surface-variant font-medium"
      />
      <StatCard
        icon="online_prediction"
        iconClassName="text-green-600 bg-green-500/10"
        label="Active Now"
        value={String(activeNow)}
        delta="Online status"
        deltaClassName="text-green-600 font-bold"
      />
      
      {/* Active Invitation Widget */}
      <Card 
        clickable={true}
        onClick={handleOpenNotifications}
        className={cn(
          "min-h-[100px] flex items-center px-lg py-md rounded-2xl border transition-all relative group",
          unreadCount > 0 
            ? "border-secondary/30 bg-secondary/[0.02] hover:border-secondary/50 hover:bg-secondary/[0.04] shadow-sm hover:shadow-md hover:-translate-y-0.5" 
            : "border-outline-variant/10 bg-surface hover:border-primary/20 hover:bg-surface-container-lowest/50"
        )}
      >
        <div
          className={cn(
            "w-[48px] h-[48px] flex items-center justify-center rounded-xl shrink-0 mr-md transition-colors",
            unreadCount > 0 
              ? "text-secondary bg-secondary/10 group-hover:bg-secondary/20" 
              : "text-on-surface-variant bg-surface-container-high/50 group-hover:text-primary group-hover:bg-primary/10"
          )}
        >
          <span className="material-symbols-outlined text-[24px]">mark_email_unread</span>
        </div>

        <div className="flex flex-col justify-center flex-1">
          <p className="text-[34px] leading-none font-bold text-on-surface">
            {unreadCount}
          </p>
          <p className="text-sm font-medium text-on-surface-variant mt-1">
            {unreadCount === 0 ? "No pending invitations" : unreadCount === 1 ? "Open Invitation" : "Open Invitations"}
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="absolute top-md right-md">
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-secondary/10 text-secondary">
              Pending response
            </span>
          </div>
        )}

        {unreadCount > 0 && (
          <div className="absolute bottom-md right-md flex items-center gap-1 text-[12px] font-bold text-secondary opacity-80 group-hover:opacity-100 transition-opacity">
            View invitation <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        )}
      </Card>
    </section>
  );
}
