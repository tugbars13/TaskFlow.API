import api from "@/api/client/axios";

export const getDashboardMetrics = async () => {
  try {
    const response = await api.get("/Tasks/dashboard");
    const dto = response.data?.data || response.data || {};

    return {
      totalTasks: dto.totalTasks ?? 0,
      completedTasks: dto.completedTasks ?? 0,
      upcomingDeadlines: dto.upcomingDeadlines ?? dto.overdueTasks ?? dto.pendingTasks ?? 0,
      productivityScore: dto.productivityScore ?? dto.completionRate ?? 0,
      highPriorityTasks: dto.highPriorityTasks ?? 0,
      todayPriorities: (dto.todayPriorities || []).map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
        progress: t.progress ?? (t.isCompleted ? 100 : 0),
        isCompleted: t.isCompleted,
        meta: [
          ...(t.dueDate ? [{ icon: "schedule", text: new Date(t.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] : []),
          ...(t.commentsCount ? [{ icon: "chat_bubble", text: `${t.commentsCount} Comments` }] : []),
          ...(t.attachmentsCount ? [{ icon: "link", text: `${t.attachmentsCount} Attachments` }] : []),
        ],
        tags: [
          ...(t.category ? [{ label: t.category, className: "bg-secondary/10 text-secondary" }] : []),
          ...(t.priority ? [{ label: `${t.priority} Priority`, className: t.priority?.toLowerCase() === "high" ? "bg-error-container/20 text-error" : "bg-primary/10 text-primary" }] : []),
        ],
      })),
      productivityPulse: dto.productivityPulse || {
        weeklyCompletedTasks: 0,
        weeklyChangePercentage: 0,
        dailyCompletionTrend: [0, 0, 0, 0, 0, 0, 0],
      },
      upcomingDeadlinesItems: (dto.upcomingDeadlinesItems || []).map((d) => ({
        id: d.id,
        title: d.title,
        dueDate: d.dueDate ? new Date(d.dueDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "No due date",
        urgency: d.priority?.toLowerCase() === "high" ? "urgent" : d.priority?.toLowerCase() === "medium" ? "warning" : "normal",
        tag: d.category || "General",
        assignee: d.assignedUser || "Alex M.",
      })),
    };
  } catch (error) {
    console.warn("Dashboard API endpoint error:", error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      upcomingDeadlines: 0,
      productivityScore: 0,
      highPriorityTasks: 0,
      todayPriorities: [],
      productivityPulse: {
        weeklyCompletedTasks: 0,
        weeklyChangePercentage: 0,
        dailyCompletionTrend: [0, 0, 0, 0, 0, 0, 0],
      },
      upcomingDeadlinesItems: [],
    };
  }
};

export const getDashboardSummary = getDashboardMetrics;
