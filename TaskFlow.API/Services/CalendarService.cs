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

    public async Task<List<CalendarEventDto>> GetCalendarEventsAsync(int userId)
    {
        return await _repository.GetCalendarEventsAsync(userId);
    }
}
