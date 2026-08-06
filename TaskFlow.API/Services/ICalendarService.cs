using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId);
}
