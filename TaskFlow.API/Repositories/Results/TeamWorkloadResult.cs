namespace TaskFlow.API.Repositories.Results;

public class TeamWorkloadResult
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int ActiveTasks { get; set; }
    public int OverdueTasks { get; set; }
}
