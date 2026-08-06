using TaskFlow.API.Models;

public interface IActivityLogRepository
{
    Task AddAsync(ActivityLog log);
}