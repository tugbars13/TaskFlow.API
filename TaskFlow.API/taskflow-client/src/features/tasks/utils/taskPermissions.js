export function getTaskPermissions(currentTeam, user, isTeamBoard) {
    const currentRole = (currentTeam?.userRole || "member").toLowerCase();

    const isOwner = currentRole === "owner";
    const isAdmin = currentRole === "admin";

    return {
        canCreateTasks: !isTeamBoard || isOwner || isAdmin,

        canEditTask: (task) =>
            !isTeamBoard ||
            isOwner ||
            isAdmin ||
            task.assignedUserId === user?.id,
    };
}