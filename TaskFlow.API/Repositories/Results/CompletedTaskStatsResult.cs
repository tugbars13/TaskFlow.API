namespace TaskFlow.API.Repositories.Results;

public class CompletedTaskStatsResult
{
    public int TotalCompleted { get; set; }
    public int OnTimeCompleted { get; set; }
    public int LateCompleted { get; set; }
}
