using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(INotificationRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task SendNotificationAsync(
        int userId,
        string title,
        string message,
        string? type = null,
        int? relatedId = null,
        bool saveChanges = true,
        CancellationToken cancellationToken = default)
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

        await _repository.AddAsync(notification, cancellationToken);
        if (saveChanges)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(
        int userId,
        bool unreadOnly = false, CancellationToken cancellationToken = default)
    {
        var notifications = await _repository.GetByUserIdAsync(
            userId,
            unreadOnly, cancellationToken);

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

    public async Task<(bool Success, string Message)> MarkAsReadAsync(
        int notificationId,
        int userId, CancellationToken cancellationToken = default)
    {
        var notification = await _repository.GetByIdAsync(notificationId, cancellationToken);

        if (notification == null)
            return (false, "NotFound");

        if (notification.UserId != userId)
            return (false, "Forbidden");

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _repository.UpdateAsync(notification, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return (true, "Success");
    }
}