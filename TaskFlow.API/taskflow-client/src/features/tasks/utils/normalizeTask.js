import normalizeStatus from "./normalizeStatus";

const PRIORITY_MAP = Object.freeze({
    1: "Low",
    2: "Medium",
    3: "High",
});

const CATEGORY_MAP = Object.freeze({
    1: "Personal",
    2: "Work",
    3: "Study",
    4: "Shopping",
    5: "Health",
});

export default function normalizeTask(t) {
    const priorityStr =
        typeof t.priority === "number"
            ? PRIORITY_MAP[t.priority] ?? "Low"
            : t.priority || "Medium";

    const categoryStr =
        typeof t.category === "number"
            ? CATEGORY_MAP[t.category] ?? "General"
            : t.category || "General";

    const statusStr = normalizeStatus(t.status, t.isCompleted);

    return {
        id: t.id,
        title: t.title || "Untitled Task",
        description: t.description || "",
        priority: priorityStr,
        category: categoryStr,
        status: statusStr,
        dueDate: t.dueDate,
        isCompleted: Boolean(t.isCompleted || statusStr === "completed"),

        meta: [
            ...(t.dueDate
                ? [
                    {
                        icon: "schedule",
                        text: new Date(t.dueDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    },
                ]
                : []),

            ...(t.commentsCount
                ? [
                    {
                        icon: "chat_bubble",
                        text: `${t.commentsCount} Comments`,
                    },
                ]
                : []),

            ...(t.attachmentsCount
                ? [
                    {
                        icon: "link",
                        text: `${t.attachmentsCount} Attachments`,
                    },
                ]
                : []),
        ],

        tags: [
            {
                label: categoryStr,
                className: "bg-secondary/10 text-secondary",
            },
            {
                label: `${priorityStr} Priority`,
                className:
                    priorityStr.toLowerCase() === "high"
                        ? "bg-error-container/20 text-error"
                        : "bg-primary/10 text-primary",
            },
        ],

        assignedUserId: t.assignedUserId,
        assignedUserFullName: t.assignedUserFullName,
        assignedUserAvatar: t.assignedUserAvatar,
        assignees: t.assignees || [],
        teamId: t.teamId,
        teamName: t.teamName,
        createdDate: t.createdDate,
    };
}
