namespace TaskFlow.API.Repositories.Results;

public class TeamAnalyticsMemberResult
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
}
