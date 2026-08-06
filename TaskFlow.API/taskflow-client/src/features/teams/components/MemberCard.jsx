import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

export default function MemberCard({ member, onEdit, onDelete }) {
  if (!member) return null;

  const {
    id,
    fullName,
    name,
    role,
    department,
    position,
    activeProjects = 0,
    workload = 0,
    status = "Active",
    avatarUrl,
    avatar,
  } = member;

  const displayName = fullName || name || "Team Member";
  const displayDepartment = department || position || "Engineering";
  const displayAvatar = avatarUrl || avatar || `https://i.pravatar.cc/150?u=${id || displayName}`;

  const getStatusBadge = (s) => {
    switch (s?.toLowerCase()) {
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "away":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Away
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200/50 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {s || "Offline"}
          </span>
        );
    }
  };

  const getWorkloadColors = (w) => {
    if (w > 85) return { text: "text-error font-bold", bar: "bg-error" };
    if (w > 60) return { text: "text-amber-600 font-bold", bar: "bg-amber-500" };
    return { text: "text-primary font-bold", bar: "bg-primary" };
  };

  const workloadColors = getWorkloadColors(workload);

  return (
    <div className="w-full bg-surface border border-outline-variant/10 hover:border-primary/30 rounded-2xl p-md lg:px-lg lg:py-md apple-shadow hover:apple-shadow-hover transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-md group">
      {/* 1. Avatar + Name & Department */}
      <div className="flex items-center gap-md min-w-[220px]">
        <div className="relative shrink-0">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-11 h-11 rounded-2xl object-cover apple-shadow border border-outline-variant/20"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
              status?.toLowerCase() === "active"
                ? "bg-emerald-500"
                : status?.toLowerCase() === "away"
                ? "bg-amber-500"
                : "bg-gray-400"
            }`}
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-headline-md text-headline-md font-bold text-on-surface truncate group-hover:text-primary transition-colors">
            {displayName}
          </h4>
          <p className="text-xs text-on-surface-variant truncate font-medium">{displayDepartment}</p>
        </div>
      </div>

      {/* 2. Role Badge */}
      <div className="w-32 shrink-0">
        <Badge className={role?.toLowerCase() === "admin" || role?.includes("Architect") || role?.includes("Lead") ? "bg-primary/10 text-primary font-semibold" : "bg-secondary/10 text-secondary font-semibold"}>
          {role || "Member"}
        </Badge>
      </div>

      {/* 3. Workload Progress Bar */}
      <div className="w-full md:w-44 shrink-0 space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-on-surface-variant font-medium">Workload</span>
          <span className={workloadColors.text}>{workload}%</span>
        </div>
        <ProgressBar value={workload} barClassName={workloadColors.bar} className="h-1.5 rounded-full bg-surface-container-high" />
      </div>

      {/* 4. Projects */}
      <div className="w-32 shrink-0 text-xs">
        <span className="text-on-surface-variant block font-medium">Projects</span>
        <span className="font-bold text-on-surface">{activeProjects} Active</span>
      </div>

      {/* 5. Status Badge */}
      <div className="w-28 shrink-0 flex items-center">
        {getStatusBadge(status)}
      </div>

      {/* 6. Action Controls */}
      <div className="flex items-center gap-xs shrink-0 pt-xs md:pt-0 border-t md:border-t-0 border-outline-variant/10">
        <button
          type="button"
          onClick={() => onEdit?.(member)}
          className="text-xs font-semibold text-on-surface-variant hover:text-primary px-md py-xs rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Profile
        </button>

        <button
          type="button"
          onClick={() => onEdit?.(member)}
          className="text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 px-md py-xs rounded-xl apple-shadow active:scale-95 transition-all cursor-pointer"
        >
          Manage
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(id)}
          className="p-xs text-on-surface-variant hover:text-error rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer ml-xs"
          title="Remove Member"
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>
    </div>
  );
}
