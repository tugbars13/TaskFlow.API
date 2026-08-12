using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly AppDbContext _context;

    public NotificationService(INotificationRepository repository, AppDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task SendNotificationAsync(int userId, string title, string message, string? type = null, int? relatedId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RelatedId = relatedId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _repository.AddAsync(notification);
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
    {
        var query = _context.Notifications.Where(n => n.UserId == userId);
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();

        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            IsRead = n.IsRead,
            Type = n.Type,
            RelatedId = n.RelatedId,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<(bool Success, string Message)> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _repository.GetByIdAsync(notificationId);
        if (notification == null) return (false, "NotFound");
        
        if (notification.UserId != userId) return (false, "Forbidden");

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _repository.UpdateAsync(notification);
            await _context.SaveChangesAsync();
        }

        return (true, "Success");
    }
}
