using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IAnalyticsService
{
    Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId);
}
