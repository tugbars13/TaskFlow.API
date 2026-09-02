// Services/TeamAuthorizationService.cs
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class TeamAuthorizationService : ITeamAuthorizationService
{
    private readonly ITeamRepository _teamRepository;

    public TeamAuthorizationService(ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId, CancellationToken cancellationToken = default)
    {
        return await _teamRepository.IsTeamMemberOrCreatorAsync(teamId, userId, cancellationToken);
    }

    public async Task<bool> CanCreateTaskForTeamAsync(int teamId, int userId, CancellationToken cancellationToken = default)
    {
        return await IsTeamMemberOrCreatorAsync(teamId, userId, cancellationToken);
    }

    public async Task<bool> CanInviteMemberAsync(int teamId, int userId, CancellationToken cancellationToken = default)
    {
        var role = await _teamRepository.GetMemberRoleAsync(teamId, userId, cancellationToken);

        var team = await _teamRepository.GetTeamAsync(teamId, cancellationToken);
        var isCreator = team != null && team.CreatedByUserId == userId;

        return role == TeamRole.Owner || role == TeamRole.Admin || isCreator;
    }

    public async Task<bool> CanManageTaskAsync(TaskItem task, int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        if (isAdmin)
            return true;

        if (!task.TeamId.HasValue)
        {
            // Personal task: Only owner or assignee can manage
            return task.UserId == userId || (task.Assignees != null && task.Assignees.Any(a => a.UserId == userId));
        }

        // Team task: Admin (above), Team Creator, or Team Member can manage
        return await IsTeamMemberOrCreatorAsync(task.TeamId.Value, userId, cancellationToken);
    }
}
