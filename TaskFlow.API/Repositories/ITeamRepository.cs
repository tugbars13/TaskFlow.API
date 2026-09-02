using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface ITeamRepository
    {
        Task<List<TeamMember>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<TeamMember?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<TeamMember> AddAsync(TeamMember member, CancellationToken cancellationToken = default);
        Task UpdateAsync(TeamMember member, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<List<Team>> GetTeamsAsync(CancellationToken cancellationToken = default);
        Task<List<Team>> GetTeamsByUserIdAsync(int userId, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default);
        Task<Team?> GetTeamAsync(int id, CancellationToken cancellationToken = default);
        Task<Team> CreateTeamAsync(Team team, CancellationToken cancellationToken = default);
        Task<bool> UpdateTeamAsync(Team team, CancellationToken cancellationToken = default);
        Task<bool> DeleteTeamAsync(int id, CancellationToken cancellationToken = default);

        /// <summary>Returns the TeamMember row for a specific user in a specific team, or null.</summary>
        Task<TeamMember?> GetMemberByTeamAndUserAsync(int teamId, int userId, CancellationToken cancellationToken = default);

        Task<List<TeamMember>> GetMembersByTeamIdAsync(int teamId, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default);
        Task<List<TeamMember>> GetMembersByTeamIdsAsync(IEnumerable<int> teamIds, CancellationToken cancellationToken = default);

        Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId, CancellationToken cancellationToken = default);
        Task<TeamRole?> GetMemberRoleAsync(int teamId, int userId, CancellationToken cancellationToken = default);
    }
}
