using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Services;
using TaskFlow.API.Responses;

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

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, unreadOnly);
            return Ok(new ApiResponse<IEnumerable<object>>
            {
                Success = true,
                Message = "Bildirimler getirildi.",
                Data = notifications
            });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var result = await _notificationService.MarkAsReadAsync(id, userId.Value);
            
            if (!result.Success)
            {
                if (result.Message == "NotFound") return NotFound(new { message = "Bildirim bulunamadı." });
                if (result.Message == "Forbidden") return Forbid();
                return BadRequest(new { message = result.Message });
            }

            return NoContent();
        }
    }
}
