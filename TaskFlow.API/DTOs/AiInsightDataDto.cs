namespace TaskFlow.API.DTOs;

public class CategoryPerformanceDto
{
    public int? CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int EarlyTasks { get; set; }
    public int NormalTasks { get; set; }
    public int NearingDeadlineTasks { get; set; }
    public int ProcrastinatedTasks { get; set; }
    public int LateTasks { get; set; }
    public double? AverageCompletionDays { get; set; }
    public double? MedianCompletionDays { get; set; }
}

public class PriorityPerformanceDto
{
    public string PriorityName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OnTimeCompletedTasks { get; set; }
    public int LateCompletedTasks { get; set; }
    public double? OnTimeCompletionRate { get; set; }
    public double? AverageCompletionDays { get; set; }
}

public class WeeklyAggregateDto
{
    public string WeekLabel { get; set; } = string.Empty;
    public int CompletedTasks { get; set; }
    public int CreatedTasks { get; set; }
}

public class AiInsightDataDto
{
    public double? OverallAverageCompletionDays { get; set; }
    public double? OverallMedianCompletionDays { get; set; }
    public CategoryPerformanceDto? FastestCategory { get; set; }
    public CategoryPerformanceDto? SlowestCategory { get; set; }
    public List<CategoryPerformanceDto> CategoryPerformances { get; set; } = new();
    public List<PriorityPerformanceDto> PriorityPerformances { get; set; } = new();

    public double OnTimeCompletionRate { get; set; }
    public int OverdueCompletedTasks { get; set; }
    public int ActiveOverdueTasks { get; set; }

    public int CurrentWeekCompleted { get; set; }
    public int PreviousWeekSamePeriodCompleted { get; set; }
    public double? WeekOverWeekChangeRatio { get; set; }

    public List<WeeklyAggregateDto> Last8WeeksTrend { get; set; } = new();
}
