using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface ITeamRepository
    {
        Task<List<TeamMember>> GetAllAsync();
        Task<TeamMember?> GetByIdAsync(int id);
        Task<TeamMember> AddAsync(TeamMember member);
        Task UpdateAsync(TeamMember member);
        Task DeleteAsync(int id);
        Task<List<Team>> GetTeamsAsync();
        Task<Team?> GetTeamAsync(int id);
        Task<Team> CreateTeamAsync(Team team);
        Task<bool> UpdateTeamAsync(Team team);
        Task<bool> DeleteTeamAsync(int id);

        /// <summary>Returns the TeamMember row for a specific user in a specific team, or null.</summary>
        Task<TeamMember?> GetMemberByTeamAndUserAsync(int teamId, int userId);

        Task<List<TeamMember>> GetMembersByTeamIdAsync(int teamId);
    }
}
