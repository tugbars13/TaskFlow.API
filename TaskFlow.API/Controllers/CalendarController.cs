using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(userId!);
    }

    [HttpGet("events")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CalendarEventDto>>>> GetEvents()
    {
        var userId = GetCurrentUserId();
        var events = await _calendarService.GetCalendarEventsAsync(userId);

        return Ok(new ApiResponse<IEnumerable<CalendarEventDto>>
        {
            Success = true,
            Message = "Takvim etkinlikleri başarıyla getirildi.",
            Data = events
        });
    }
}
