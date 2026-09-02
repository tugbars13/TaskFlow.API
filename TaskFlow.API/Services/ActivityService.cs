// Services/ActivityService.cs
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityLogRepository _repository;

    public ActivityService(IActivityLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ActivityLog>> GetLogsByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _repository.GetLogsByUserIdAsync(userId, cancellationToken);
    }
}