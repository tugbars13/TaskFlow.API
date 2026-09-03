using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
namespace TaskFlow.API.Services;

public interface INotificationService
{
    Task SendNotificationAsync(int userId, string title, string message, string? type = null, int? relatedId = null, bool saveChanges = true, CancellationToken cancellationToken = default);
    Task<List<TaskFlow.API.DTOs.NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false, CancellationToken cancellationToken = default);
    Task<(bool Success, string Message)> MarkAsReadAsync(int notificationId, int userId, CancellationToken cancellationToken = default);
    Task<TaskFlow.API.DTOs.NotificationPreferencesDto> GetPreferencesAsync(int userId, CancellationToken cancellationToken = default);
    Task<TaskFlow.API.DTOs.NotificationPreferencesDto> UpdatePreferencesAsync(int userId, TaskFlow.API.DTOs.UpdateNotificationPreferencesDto dto, CancellationToken cancellationToken = default);
}
