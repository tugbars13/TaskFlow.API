import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
export default function TasksHeader({
  isTeamBoard,
  currentTeam,
  teams,
  teamId,
  navigate,
  teamMembers,
  totalCount,
  completedCount,
  canCreateTasks,
  handleOpenNewTaskModal,
}) {
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const teamStats = [
    {
      label: "Members",
      value: currentTeam?.memberCount || teamMembers.length,
      valueClassName: "text-on-surface",
    },
    {
      label: "Total",
      value: totalCount,
      valueClassName: "text-on-surface",
    },
    {
      label: "Done",
      value: completedCount,
      valueClassName: "text-green-600",
    },
  ];
  const pageTitle = isTeamBoard ? currentTeam?.name || "Team" : "Tasks";

  const pageDescription = isTeamBoard
    ? "Shared team board. Manage deliverables and workflow progress."
    : "Manage agile deliverables, assignees, and workflow progress.";
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          {isTeamBoard ? (
            <>
              <div className="flex items-center gap-sm text-on-surface-variant font-medium text-sm mb-xs">
                <Link
                  to="/team"
                  className="hover:text-primary transition-colors"
                >
                  Teams
                </Link>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
                <span className="text-primary">
                  {currentTeam?.name || "Backend Team"}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  groups
                </span>
                {teams.length > 1 ? (
                  <select
                    className="font-display-lg text-display-lg font-bold text-on-surface bg-transparent border-none outline-none cursor-pointer hover:text-primary appearance-none pr-md"
                    value={teamId || ""}
                    onChange={(e) => navigate(`/teams/${e.target.value}/tasks`)}
                  >
                    {teams.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        className="text-body-md font-medium text-on-surface"
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                    {currentTeam?.name || "Team"}
                  </h1>
                )}
              </div>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                Shared team board. Manage deliverables and workflow progress.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  view_kanban
                </span>
                <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                  Tasks
                </h1>
              </div>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                Manage agile deliverables, assignees, and workflow progress.
              </p>
            </>
          )}
        </div>

        {/* Dynamic Team Avatars & Stats */}
        <div className="flex items-center gap-md flex-wrap">
          {isTeamBoard && (
            <div className="flex items-center gap-md mr-md">
              {teamStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center px-sm ${
                    index < teamStats.length - 1
                      ? "border-r border-outline-variant/10"
                      : ""
                  }`}
                >
                  <span className={`text-xl font-bold ${stat.valueClassName}`}>
                    {stat.value}
                  </span>

                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar (if Team Board) */}
          {isTeamBoard && totalCount > 0 && (
            <div className="flex flex-col gap-xs mr-md min-w-[120px]">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide">
                <span className="text-on-surface-variant">Progress</span>
                <span className="text-primary">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Filters */}
          {/* Filters Removed */}

          {canCreateTasks && (
            <Button
              variant="filled"
              onClick={handleOpenNewTaskModal}
              startIcon={
                <span className="material-symbols-outlined !text-[20px] !leading-none">
                  add
                </span>
              }
              className="px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform text-sm font-semibold"
            >
              New Task
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
