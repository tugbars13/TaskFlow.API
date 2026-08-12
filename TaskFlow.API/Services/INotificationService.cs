namespace TaskFlow.API.Services;

public interface INotificationService
{
    Task SendNotificationAsync(int userId, string title, string message, string? type = null, int? relatedId = null);
    Task<List<TaskFlow.API.DTOs.NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
    Task<(bool Success, string Message)> MarkAsReadAsync(int notificationId, int userId);
}
