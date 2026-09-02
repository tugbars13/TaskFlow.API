using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class CalendarService : ICalendarService
{
    private readonly ICalendarRepository _repository;

    public CalendarService(ICalendarRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetTasksForCalendarAsync(userId, cancellationToken);
        return tasks.Select(t => new CalendarEventDto
        {
            Id = t.Id,
            Title = t.Title,
            StartDate = t.DueDate ?? t.CreatedDate,
            EndDate = (t.DueDate ?? t.CreatedDate).AddHours(1),
            Category = t.Category != null ? t.Category.Name : "",
            Color = t.Priority == Models.TaskPriority.High
                ? "bg-rose-50/80 text-rose-700 font-semibold"
                : t.Priority == Models.TaskPriority.Medium
                    ? "bg-indigo-50/80 text-indigo-700"
                    : "bg-sky-50/80 text-sky-700",
            IsAllDay = !t.DueDate.HasValue
        }).ToList();
    }
}
