using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public interface INotificationRepository
{
    Task<Notification> AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<List<Notification>> GetByUserIdAsync(int userId, bool unreadOnly = false, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<Notification>> GetUnreadTeamInvitationsAsync(int userId, int teamId, CancellationToken cancellationToken = default);
    Task DeleteTeamInvitationsAsync(int teamId, CancellationToken cancellationToken = default);
    Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<NotificationPreference?> GetPreferenceByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task AddPreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
    Task UpdatePreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
}
