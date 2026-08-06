using TaskFlow.API.Models;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _repository;

    public ActivityLogService(IActivityLogRepository repository)
    {
        _repository = repository;
    }

    public async Task LogAsync(int userId, string action, string description)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Description = description,
            CreatedDate = DateTime.UtcNow
        };

        await _repository.AddAsync(log);
    }
}