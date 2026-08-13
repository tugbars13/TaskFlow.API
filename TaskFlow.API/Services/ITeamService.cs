using TaskFlow.API.DTOs;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Services
{
    public interface ITeamService
    {
        Task<List<TeamMemberDto>> GetAllAsync();
        Task<List<TeamMemberDto>> GetMembersByTeamIdAsync(int teamId);
        Task<TeamMemberDto?> GetByIdAsync(int id);
        Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto);
        Task<bool> UpdateAsync(int id, UpdateTeamMemberDto dto);
        Task<bool> DeleteAsync(int id);

        Task<List<TeamDto>> GetTeamsAsync(int currentUserId);
        Task<TeamDto?> GetTeamAsync(int id);
        Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, int currentUserId);
        Task<bool> UpdateTeamAsync(int id, UpdateTeamDto dto);
        Task<bool> DeleteTeamAsync(int id);

        /// <summary>Returns the TeamRole string for a user within a specific team, or null if not a member.</summary>
        Task<string?> GetUserRoleInTeamAsync(int teamId, int userId);

        /// <summary>Returns the TeamMember row for a given user/team combo, or null if not found.</summary>
        Task<TeamMemberDto?> GetMemberByTeamAndUserAsync(int teamId, int userId);

        Task<List<UserDto>> GetInvitableUsersAsync(int teamId, int currentUserId);

        Task<(bool Success, string Message)> InviteUserAsync(int teamId, int userIdToInvite, int currentUserId);
        Task<(bool Success, string Message)> AcceptInvitationAsync(int teamId, int userId);
        Task<(bool Success, string Message)> RejectInvitationAsync(int teamId, int userId);
    }
}