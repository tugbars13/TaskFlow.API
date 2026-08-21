import { useMemo } from "react";
import groupTasksByStatus from "../utils/groupTasksByStatus";
import { KANBAN_COLUMNS } from "../constants/kanbanColumns.constants";

export default function useTaskBoardData({
    tasks,
    teams,
    teamId,
    isTeamBoard,
    filters = {},
    currentUserId,
}) {
    const currentTeam = useMemo(() => {
        return isTeamBoard
            ? teams.find((team) => team.id === Number(teamId))
            : null;
    }, [teams, teamId, isTeamBoard]);

    const filteredTasks = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.filter(t => {
            if (isTeamBoard && Number(t.teamId) !== Number(teamId)) {
                return false;
            }

            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                const title = (t.title || "").toLowerCase();
                const desc = (t.description || "").toLowerCase();
                if (!title.includes(kw) && !desc.includes(kw)) return false;
            }

            if (filters.priority && String(t.priority).toLowerCase() !== String(filters.priority).toLowerCase()) {
                return false;
            }

            if (filters.category && String(t.category).toLowerCase() !== String(filters.category).toLowerCase()) {
                return false;
            }

            if (filters.status) {
                const filterStat = String(filters.status).toLowerCase().replace(/_/g, "");
                const taskStat = String(t.status || "").toLowerCase().replace(/_/g, "");
                if (filterStat !== taskStat) return false;
            }

            if (filters.assigneeId) {
                if (filters.assigneeId === "Unassigned") {
                    if (t.assignedUserId != null) return false;
                } else if (filters.assigneeId === "Me") {
                    if (String(t.assignedUserId) !== String(currentUserId)) return false;
                } else {
                    if (String(t.assignedUserId) !== String(filters.assigneeId)) return false;
                }
            }

            if (filters.dueDateRange) {
                if (filters.dueDateRange === "NoDueDate") {
                    if (t.dueDate) return false;
                } else {
                    if (!t.dueDate) return false;
                    const taskDate = new Date(t.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (filters.dueDateRange === "Overdue") {
                        if (taskDate >= today || t.isCompleted) return false;
                    } else if (filters.dueDateRange === "Today") {
                        if (taskDate.getTime() !== today.getTime()) return false;
                    } else if (filters.dueDateRange === "ThisWeek") {
                        const endOfWeek = new Date(today);
                        endOfWeek.setDate(today.getDate() + 7);
                        if (taskDate < today || taskDate > endOfWeek) return false;
                    }
                }
            }

            return true;
        });
    }, [tasks, filters, currentUserId, isTeamBoard, teamId]);

    const {
        backlog,
        todo,
        inProgress,
        completed,
    } = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);

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

    return {
        currentTeam,
        columns,
        completedCount: completed.length,
        totalCount,
    };
}
