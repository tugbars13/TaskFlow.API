using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories.Results;

public class PriorityPerformanceResult
{
    public TaskPriority Priority { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OnTimeCompletedTasks { get; set; }
    public int LateCompletedTasks { get; set; }
    public double? AverageCompletionDays { get; set; }
}
