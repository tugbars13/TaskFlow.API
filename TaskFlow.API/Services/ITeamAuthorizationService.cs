// Services/ITeamAuthorizationService.cs
namespace TaskFlow.API.Services;

public interface ITeamAuthorizationService
{
    Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId);
    Task<bool> CanCreateTaskForTeamAsync(int teamId, int userId);
    Task<bool> CanInviteMemberAsync(int teamId, int userId);
    Task<bool> CanManageTaskAsync(TaskItem task, int userId, bool isAdmin);
}