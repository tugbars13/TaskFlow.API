import StatCard from "@/components/ui/StatCard";

export default function TeamStats({ stats }) {
  const { totalMembers = 5, activeNow = 4, openInvitations = 2 } = stats || {};

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
      <StatCard
        icon="mark_email_unread"
        iconClassName="text-secondary bg-secondary/10"
        label="Open Invitations"
        value={String(openInvitations)}
        delta="Pending response"
        deltaClassName="text-secondary font-bold"
      />
    </section>
  );
}
