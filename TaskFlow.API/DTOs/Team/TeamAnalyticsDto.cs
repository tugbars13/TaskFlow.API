namespace TaskFlow.API.DTOs.Team;

public class TeamAnalyticsDto
{
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int CompletionRate { get; set; }
    public int PreviousPeriodCompletionRate { get; set; }
    public List<ProgressTrendDto> ProgressTrend { get; set; } = new();
    public List<ActiveMemberDto> ActiveMembers { get; set; } = new();
    public List<OverdueTaskDto> OverdueTasksList { get; set; } = new();
    public string AiSummary { get; set; } = string.Empty;
    public string PeriodDateRange { get; set; } = string.Empty;
}

public class ProgressTrendDto
{
    public string Label { get; set; } = string.Empty;
    public int CompletionRate { get; set; }
}

public class ActiveMemberDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
}

public class OverdueTaskDto
{
    public int TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OverdueDays { get; set; }
    public string AssigneeName { get; set; } = string.Empty;
}


