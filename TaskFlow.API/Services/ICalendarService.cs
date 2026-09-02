using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId, CancellationToken cancellationToken = default);
}
