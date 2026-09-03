using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    Task<List<User>> GetAllAsync(int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<List<User>> GetInvitableUsersForTeamAsync(int teamId, int currentUserId, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task DeleteUserWithRelationsAsync(int userId, CancellationToken cancellationToken = default);
    Task<User?> GetByResetPasswordTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
}
