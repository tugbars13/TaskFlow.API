namespace TaskFlow.API.DTOs;

public class DashboardDto
{
    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int PendingTasks { get; set; }

    public int OverdueTasks { get; set; }

    public int HighPriorityTasks { get; set; }

    public int TodayTasks { get; set; }

    public int CompletedToday { get; set; }

    public double CompletionRate { get; set; }

    public List<TodayPriorityTaskDto> TodayPriorities { get; set; } = new();

    public ProductivityPulseDto ProductivityPulse { get; set; } = new();

    public List<UpcomingDeadlineDto> UpcomingDeadlinesItems { get; set; } = new();
}