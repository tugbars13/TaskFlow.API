using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly AppDbContext _context;

        public TeamRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeamMember>> GetAllAsync()
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .ToListAsync();
        }

        public async Task<List<TeamMember>> GetMembersByTeamIdAsync(int teamId)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .Where(tm => tm.TeamId == teamId)
                .ToListAsync();
        }

        public async Task<TeamMember?> GetByIdAsync(int id)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.Id == id);
        }

        public async Task<TeamMember> AddAsync(TeamMember member)
        {
            _context.TeamMembers.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task UpdateAsync(TeamMember member)
        {
            _context.TeamMembers.Update(member);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var member = await _context.TeamMembers.FindAsync(id);

            if (member == null)
                return;

            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Team>> GetTeamsAsync()
        {
            return await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .ToListAsync();
        }

        public async Task<Team?> GetTeamAsync(int id)
        {
            return await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Team> CreateTeamAsync(Team team)
        {
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();
            return team;
        }

        public async Task<bool> UpdateTeamAsync(Team team)
        {
            var existingTeam = await _context.Teams.FindAsync(team.Id);

            if (existingTeam == null)
                return false;

            existingTeam.Name = team.Name;
            existingTeam.Description = team.Description;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteTeamAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);

            if (team == null)
                return false;

            var hasTasks = await _context.Tasks.AnyAsync(t => t.TeamId == id && !t.IsDeleted);
            if (hasTasks)
            {
                throw new InvalidOperationException("HasTasks");
            }

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<TeamMember?> GetMemberByTeamAndUserAsync(int teamId, int userId)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);
        }
    }
}