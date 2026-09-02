using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Services
{
    public interface ITeamService
    {
        Task<List<TeamMemberDto>> GetAllAsync(int currentUserId, CancellationToken cancellationToken = default);
        Task<List<TeamMemberDto>> GetMembersByTeamIdAsync(int teamId, PaginationDto pagination, CancellationToken cancellationToken = default);
        Task<TeamMemberDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto, int userId, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(int id, UpdateTeamMemberDto dto, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        Task<List<TeamDto>> GetTeamsAsync(int currentUserId, PaginationDto pagination, CancellationToken cancellationToken = default);
        Task<TeamDto?> GetTeamAsync(int id, CancellationToken cancellationToken = default);
        Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, int currentUserId, CancellationToken cancellationToken = default);
        Task<bool> UpdateTeamAsync(int id, UpdateTeamDto dto, CancellationToken cancellationToken = default);
        Task<bool> DeleteTeamAsync(int id, CancellationToken cancellationToken = default);

        /// <summary>Returns the TeamRole string for a user within a specific team, or null if not a member.</summary>
        Task<string?> GetUserRoleInTeamAsync(int teamId, int userId, CancellationToken cancellationToken = default);

        /// <summary>Returns the TeamMember row for a given user/team combo, or null if not found.</summary>
        Task<TeamMemberDto?> GetMemberByTeamAndUserAsync(int teamId, int userId, CancellationToken cancellationToken = default);

        Task<List<UserDto>> GetInvitableUsersAsync(int teamId, int currentUserId, CancellationToken cancellationToken = default);

        Task<(bool Success, string Message)> InviteUserAsync(int teamId, int userIdToInvite, int currentUserId, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> AcceptInvitationAsync(int teamId, int userId, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> RejectInvitationAsync(int teamId, int userId, CancellationToken cancellationToken = default);
    }
}
