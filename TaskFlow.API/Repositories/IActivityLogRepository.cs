using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Models;

public interface IActivityLogRepository
{
    Task AddAsync(ActivityLog log, CancellationToken cancellationToken = default);
    Task<List<ActivityLog>> GetLogsByUserIdAsync(int userId, CancellationToken cancellationToken = default);
}
