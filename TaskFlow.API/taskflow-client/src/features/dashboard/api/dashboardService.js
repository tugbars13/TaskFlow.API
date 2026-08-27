import api from "@/api/client/axios";

const defaultProductivityPulse = {
  weeklyCompletedTasks: 0,
  weeklyChangePercentage: 0,
  dailyCompletionTrend: [0, 0, 0, 0, 0, 0, 0],
};

const defaultDashboardMetrics = {
  totalTasks: 0,
  completedTasks: 0,
  upcomingDeadlines: 0,
  productivityScore: 0,
  highPriorityTasks: 0,
  todayPriorities: [],
  productivityPulse: defaultProductivityPulse,
  upcomingDeadlinesItems: [],
};

const mapTodayPriority = (task) => ({
  id: task.id,
  title: task.title,
  priority: task.priority,
  category: task.category,
  categoryId: task.categoryId,
  dueDate: task.dueDate,
  progress: task.progress ?? (task.isCompleted ? 100 : 0),
  isCompleted: task.isCompleted,

  meta: [
    ...(task.dueDate
      ? [
          {
            icon: "schedule",
            text: new Date(task.dueDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]
      : []),

    ...(task.commentsCount
      ? [
          {
            icon: "chat_bubble",
            text: `${task.commentsCount} Comments`,
          },
        ]
      : []),

    ...(task.attachmentsCount
      ? [
          {
            icon: "link",
            text: `${task.attachmentsCount} Attachments`,
          },
        ]
      : []),
  ],

  tags: [
    ...(task.category
      ? [
          {
            label: task.category,
            className: "bg-secondary/10 text-secondary",
          },
        ]
      : []),

    ...(task.priority
      ? [
          {
            label: `${task.priority} Priority`,
            className:
              task.priority.toLowerCase() === "high"
                ? "bg-error-container/20 text-error"
                : "bg-primary/10 text-primary",
          },
        ]
      : []),
  ],
});

const mapUpcomingDeadline = (deadline) => ({
  id: deadline.id,
  title: deadline.title,
  categoryId: deadline.categoryId,
  dueDate: deadline.dueDate
    ? new Date(deadline.dueDate).toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "No due date",

  urgency:
    deadline.priority?.toLowerCase() === "high"
      ? "urgent"
      : deadline.priority?.toLowerCase() === "medium"
        ? "warning"
        : "normal",

  tag: deadline.category || "General",
  assignee: deadline.assignedUser || "Alex M.",
});

export const getDashboardMetrics = async () => {
  try {
    const response = await api.get("/Tasks/dashboard");
    const dto = response.data?.data ?? {};

    return {
      totalTasks: dto.totalTasks ?? 0,
      completedTasks: dto.completedTasks ?? 0,
      upcomingDeadlines:
        dto.upcomingDeadlines ?? dto.overdueTasks ?? dto.pendingTasks ?? 0,

      productivityScore: dto.productivityScore ?? dto.completionRate ?? 0,

      highPriorityTasks: dto.highPriorityTasks ?? 0,

      todayPriorities: (dto.todayPriorities ?? []).map(mapTodayPriority),

      productivityPulse: dto.productivityPulse ?? defaultProductivityPulse,

      upcomingDeadlinesItems: (dto.upcomingDeadlinesItems ?? []).map(
        mapUpcomingDeadline,
      ),
    };
  } catch (error) {
    console.warn("Dashboard API endpoint error:", error);
    return defaultDashboardMetrics;
  }
};

export const getDashboardSummary = getDashboardMetrics;
