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

    public async Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId)
    {
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .ToListAsync();

        return tasks.Select(t => new CalendarEventDto
        {
            Id = t.Id,
            Title = t.Title,
            StartDate = t.DueDate ?? t.CreatedDate,
            EndDate = (t.DueDate ?? t.CreatedDate).AddHours(1),
            Category = t.Category.ToString(),
            Color = t.Priority == Models.TaskPriority.High
                ? "bg-rose-50/80 text-rose-700 font-semibold"
                : t.Priority == Models.TaskPriority.Medium
                    ? "bg-indigo-50/80 text-indigo-700"
                    : "bg-sky-50/80 text-sky-700",
            IsAllDay = !t.DueDate.HasValue
        }).ToList();
    }
}
