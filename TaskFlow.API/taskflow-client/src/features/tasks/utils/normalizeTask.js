import normalizeStatus from "./normalizeStatus";

export default function normalizeTask(t) {
    const priorityStr =
        typeof t.priority === "number"
            ? t.priority === 3
                ? "High"
                : t.priority === 2
                    ? "Medium"
                    : "Low"
            : t.priority || "Medium";

    const categoryStr =
        typeof t.category === "number"
            ? t.category === 1
                ? "Personal"
                : t.category === 2
                    ? "Work"
                    : t.category === 3
                        ? "Study"
                        : t.category === 4
                            ? "Shopping"
                            : t.category === 5
                                ? "Health"
                                : "General"
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
        teamId: t.teamId,
        teamName: t.teamName,
    };
}