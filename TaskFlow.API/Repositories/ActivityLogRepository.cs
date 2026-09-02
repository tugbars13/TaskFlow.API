using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using Microsoft.EntityFrameworkCore;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly AppDbContext _context;

    public ActivityLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ActivityLog log, CancellationToken cancellationToken = default)
    {
        _context.ActivityLogs.Add(log);
    }

    public async Task<List<ActivityLog>> GetLogsByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.ActivityLogs
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }
}
