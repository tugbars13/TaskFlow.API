using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _repository;

    public AnalyticsService(IAnalyticsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId)
    {
        return await _repository.GetAnalyticsMetricsAsync(userId);
    }
}
