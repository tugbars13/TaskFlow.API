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

    public async Task<TaskFlow.API.DTOs.NotificationPreferencesDto> GetPreferencesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var preference = await _repository.GetPreferenceByUserIdAsync(userId, cancellationToken);

        if (preference == null)
        {
            preference = new NotificationPreference
            {
                UserId = userId,
                EmailEnabled = true,
                PushEnabled = true,
                TaskAssignments = "Email & Push",
                DueDateReminders = "Email & Push",
                SystemUpdates = "Email Only"
            };
            await _repository.AddPreferenceAsync(preference, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new TaskFlow.API.DTOs.NotificationPreferencesDto
        {
            EmailEnabled = preference.EmailEnabled,
            PushEnabled = preference.PushEnabled,
            TaskAssignments = preference.TaskAssignments,
            DueDateReminders = preference.DueDateReminders,
            SystemUpdates = preference.SystemUpdates
        };
    }

    public async Task<TaskFlow.API.DTOs.NotificationPreferencesDto> UpdatePreferencesAsync(int userId, TaskFlow.API.DTOs.UpdateNotificationPreferencesDto dto, CancellationToken cancellationToken = default)
    {
        var preference = await _repository.GetPreferenceByUserIdAsync(userId, cancellationToken);

        if (preference == null)
        {
            preference = new NotificationPreference
            {
                UserId = userId,
                EmailEnabled = dto.EmailEnabled,
                PushEnabled = dto.PushEnabled,
                TaskAssignments = dto.TaskAssignments,
                DueDateReminders = dto.DueDateReminders,
                SystemUpdates = dto.SystemUpdates
            };
            await _repository.AddPreferenceAsync(preference, cancellationToken);
        }
        else
        {
            preference.EmailEnabled = dto.EmailEnabled;
            preference.PushEnabled = dto.PushEnabled;
            preference.TaskAssignments = dto.TaskAssignments;
            preference.DueDateReminders = dto.DueDateReminders;
            preference.SystemUpdates = dto.SystemUpdates;
            await _repository.UpdatePreferenceAsync(preference, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TaskFlow.API.DTOs.NotificationPreferencesDto
        {
            EmailEnabled = preference.EmailEnabled,
            PushEnabled = preference.PushEnabled,
            TaskAssignments = preference.TaskAssignments,
            DueDateReminders = preference.DueDateReminders,
            SystemUpdates = preference.SystemUpdates
        };
    }
}