export default function WorkloadDistribution({ teamWorkload = [] }) {
  const members = teamWorkload || [];

  return (
    <div className="col-span-12 lg:col-span-6 bg-surface p-lg rounded-xl apple-shadow">
      <h3 className="font-headline-md text-headline-md font-semibold mb-md">Team Workload Distribution</h3>
      <div className="space-y-lg">
        {members.length === 0 ? (
          <div className="p-md text-center text-xs text-on-surface-variant bg-surface-container-low/40 rounded-xl">
            No team workload data available.
          </div>
        ) : (
          members.map((member, idx) => (
            <div key={member.id || idx} className="space-y-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={member.avatar}
                      alt={member.name}
                    />
                  </div>
                  <span className="font-label-md">{member.name}</span>
                </div>
                <span className={`text-body-sm font-bold ${member.color === "bg-primary" ? "text-primary" : member.color === "bg-secondary" ? "text-secondary" : "text-tertiary"}`}>
                  {member.capacity}% Capacity
                </span>
              </div>
              <div className="w-full h-[6px] bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${member.color || "bg-primary"} progress-bar-ease`} style={{ width: `${member.capacity}%` }} />
              </div>
              <div className="flex justify-between text-label-sm text-on-surface-variant">
                <span>{member.activeTasks} Active Tasks</span>
                <span>{member.overdueTasks} Overdue</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
