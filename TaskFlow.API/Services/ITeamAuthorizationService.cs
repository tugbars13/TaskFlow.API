// Services/ITeamAuthorizationService.cs
using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Models;
namespace TaskFlow.API.Services;

public interface ITeamAuthorizationService
{
    Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId, CancellationToken cancellationToken = default);
    Task<bool> CanCreateTaskForTeamAsync(int teamId, int userId, CancellationToken cancellationToken = default);
    Task<bool> CanInviteMemberAsync(int teamId, int userId, CancellationToken cancellationToken = default);
    Task<bool> CanManageTaskAsync(TaskItem task, int userId, bool isAdmin, CancellationToken cancellationToken = default);
}