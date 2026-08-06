using TaskFlow.API.DTOs;

namespace TaskFlow.API.Repositories;

public interface ICalendarRepository
{
    Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId);
}
