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
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(userId!);
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<ApiResponse<AnalyticsDto>>> GetMetrics()
    {
        var userId = GetCurrentUserId();
        var metrics = await _analyticsService.GetAnalyticsMetricsAsync(userId);

        return Ok(new ApiResponse<AnalyticsDto>
        {
            Success = true,
            Message = "Weekly analytics metrics fetched successfully.",
            Data = metrics
        });
    }
}
