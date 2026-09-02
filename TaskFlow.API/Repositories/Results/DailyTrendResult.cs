using System;

namespace TaskFlow.API.Repositories.Results;

public class DailyTrendResult
{
    public DateTime Date { get; set; }
    public int CreatedCount { get; set; }
    public int CompletedCount { get; set; }
}
