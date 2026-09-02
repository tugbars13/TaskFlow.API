using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.DTOs;
using System;
using System.Collections.Generic;
using TaskFlow.API.Repositories.Results;
namespace TaskFlow.API.Repositories;

public interface IAnalyticsRepository
{
    Task<List<DailyTrendResult>> GetDailyTrendAsync(int userId, DateTime startDate, CancellationToken cancellationToken = default);
    Task<int> GetActiveTaskCountAsync(int userId, CancellationToken cancellationToken = default);
    Task<int> GetOverdueTaskCountAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TeamWorkloadResult>> GetTeamWorkloadsAsync(int userId, CancellationToken cancellationToken = default);
    Task<CompletedTaskStatsResult> GetCompletedTaskStatsAsync(int userId, CancellationToken cancellationToken = default);
    Task<double?> GetAverageCompletionDaysAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TaskDateProjectionResult>> GetTaskDatesForMetricsAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<CategoryPerformanceResult>> GetCategoryPerformancesAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<PriorityPerformanceResult>> GetPriorityPerformancesAsync(int userId, CancellationToken cancellationToken = default);
}
