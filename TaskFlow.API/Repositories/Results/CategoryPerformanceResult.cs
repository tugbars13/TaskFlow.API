namespace TaskFlow.API.Repositories.Results;

public class CategoryPerformanceResult
{
    public int? CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double? AverageCompletionDays { get; set; }
}
