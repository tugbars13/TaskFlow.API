namespace TaskFlow.API.DTOs;

public class CompletionTrendItemDto
{
    public string Date { get; set; } = string.Empty;
    public string Day { get; set; } = string.Empty;
    public int Created { get; set; }
    public int Completed { get; set; }
}

public class TeamWorkloadMemberDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public int Workload { get; set; }
    public int ActiveTasks { get; set; }
    public int OverdueTasks { get; set; }
}

public class AnalyticsDto
{
    public string TimeRange { get; set; } = "30d";
    public List<CompletionTrendItemDto> CompletionTrend { get; set; } = new();
    public List<TeamWorkloadMemberDto> TeamWorkload { get; set; } = new();
}
