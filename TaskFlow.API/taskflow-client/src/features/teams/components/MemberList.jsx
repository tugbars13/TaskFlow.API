import MemberCard from "./MemberCard";
import InviteMemberCard from "./InviteMemberCard";

export default function MemberList({ members = [], onInvite, onEdit, onDelete }) {
  return (
    <div className="space-y-md flex flex-col w-full">
      {/* 1. Full-Width Horizontal Member List Rows */}
      <div className="space-y-md w-full">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* 2. Full-Width Dashed Add Member Section */}
      <InviteMemberCard onInvite={onInvite} />
    </div>
  );
}
