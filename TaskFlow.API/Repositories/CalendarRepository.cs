using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Repositories;

public class CalendarRepository : ICalendarRepository
{
    private readonly AppDbContext _context;

    public CalendarRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskItem>> GetTasksForCalendarAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
