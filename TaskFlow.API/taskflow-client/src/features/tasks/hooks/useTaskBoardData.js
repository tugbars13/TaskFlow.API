import { useMemo } from "react";
import groupTasksByStatus from "../utils/groupTasksByStatus";
import { KANBAN_COLUMNS } from "../constants/kanbanColumns.constants";

export default function useTaskBoardData({
    tasks,
    teams,
    teamId,
    isTeamBoard,
}) {
    const currentTeam = useMemo(() => {
        return isTeamBoard
            ? teams.find((team) => team.id === Number(teamId))
            : null;
    }, [teams, teamId, isTeamBoard]);

    const {
        backlog,
        todo,
        inProgress,
        completed,
    } = useMemo(() => groupTasksByStatus(tasks), [tasks]);

    const columns = useMemo(() => {
        return KANBAN_COLUMNS.map((column) => ({
            ...column,
            tasks:
                column.statusId === "backlog"
                    ? backlog
                    : column.statusId === "todo"
                        ? todo
                        : column.statusId === "in_progress"
                            ? inProgress
                            : completed,
        }));
    }, [backlog, todo, inProgress, completed]);

    const totalCount = useMemo(() => {
        return columns.reduce(
            (total, column) => total + column.tasks.length,
            0
        );
    }, [columns]);

    const handleSelectTeam = (teamId) => {
        setSelectedTeamForTask(teamId);
        setIsSelectTeamModalOpen(false);
        setIsFormModalOpen(true);
    };
    const handleCloseSelectTeam = () => {
        setIsSelectTeamModalOpen(false);
    };

    return {
        currentTeam,
        columns,
        completedCount: completed.length,
        totalCount,
        handleSelectTeam,
        handleCloseSelectTeam,
    };
}
