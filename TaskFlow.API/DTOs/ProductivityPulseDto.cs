namespace TaskFlow.API.DTOs;

public class ProductivityPulseDto
{
    public int WeeklyCompletedTasks { get; set; }
    public double WeeklyChangePercentage { get; set; }
    public List<int> DailyCompletionTrend { get; set; } = new();
}
