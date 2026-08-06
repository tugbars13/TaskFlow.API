using TaskFlow.API.DTOs;

namespace TaskFlow.API.Repositories;

public interface IAnalyticsRepository
{
    Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId);
}
