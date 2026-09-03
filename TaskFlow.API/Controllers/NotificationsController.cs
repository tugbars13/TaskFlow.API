using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;
namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException();

            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();

            var notifications =
                await _notificationService.GetUserNotificationsAsync(userId, unreadOnly, cancellationToken);

            return Ok(new ApiResponse<List<NotificationDto>>
            {
                Success = true,
                Message = "Bildirimler getirildi.",
                Data = notifications
            });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();

            var result = await _notificationService.MarkAsReadAsync(id, userId, cancellationToken);

            if (!result.Success)
            {
                if (result.Message == "NotFound")
                    return NotFound(new { message = "Bildirim bulunamadı." });

                if (result.Message == "Forbidden")
                    return Forbid();

            }

            return NoContent();
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var preferences = await _notificationService.GetPreferencesAsync(userId, cancellationToken);
            return Ok(preferences);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var preferences = await _notificationService.UpdatePreferencesAsync(userId, dto, cancellationToken);
            return Ok(preferences);
        }
    }
}
