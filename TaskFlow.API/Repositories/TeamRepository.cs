using System.Threading;
using System.Threading.Tasks;
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

        public async Task<List<TeamMember>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .AsNoTracking()
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<TeamMember>> GetMembersByTeamIdAsync(int teamId, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .AsNoTracking()
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .Where(tm => tm.TeamId == teamId)
                .OrderBy(tm => tm.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<TeamMember>> GetMembersByTeamIdsAsync(IEnumerable<int> teamIds, CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .AsNoTracking()
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .Where(tm => teamIds.Contains(tm.TeamId))
                .ToListAsync(cancellationToken);
        }

        public async Task<TeamMember?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.Id == id, cancellationToken);
        }

        public async Task<TeamMember> AddAsync(TeamMember member, CancellationToken cancellationToken = default)
        {
            _context.TeamMembers.Add(member);

            return member;
        }

        public async Task UpdateAsync(TeamMember member, CancellationToken cancellationToken = default)
        {
            _context.TeamMembers.Update(member);

        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var member = await _context.TeamMembers.FindAsync(new object[] { id }, cancellationToken);

            if (member == null)
                return;

            _context.TeamMembers.Remove(member);

        }

        public async Task<List<Team>> GetTeamsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Teams
                .AsNoTracking()
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Team>> GetTeamsByUserIdAsync(int userId, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default)
        {
            return await _context.Teams
                .AsNoTracking()
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .Where(t => t.Members.Any(m => m.UserId == userId && m.Status == TeamMemberStatus.Accepted) || t.CreatedByUserId == userId)
                .OrderBy(t => t.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<Team?> GetTeamAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        public async Task<Team> CreateTeamAsync(Team team, CancellationToken cancellationToken = default)
        {
            _context.Teams.Add(team);

            return team;
        }

        public async Task<bool> UpdateTeamAsync(Team team, CancellationToken cancellationToken = default)
        {
            var existingTeam = await _context.Teams.FindAsync(new object[] { team.Id }, cancellationToken);

            if (existingTeam == null)
                return false;

            existingTeam.Name = team.Name;
            existingTeam.Description = team.Description;



            return true;
        }

        public async Task<bool> DeleteTeamAsync(int id, CancellationToken cancellationToken = default)
        {
            var team = await _context.Teams.FindAsync(new object[] { id }, cancellationToken);

            if (team == null)
                return false;

            _context.Teams.Remove(team);

            return true;
        }

        public async Task<TeamMember?> GetMemberByTeamAndUserAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .Include(tm => tm.User)
                .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId, cancellationToken);
        }


        public async Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            var isMember = await _context.TeamMembers
                .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId && tm.Status == TeamMemberStatus.Accepted, cancellationToken);
            var isCreator = await _context.Teams
                .AnyAsync(t => t.Id == teamId && t.CreatedByUserId == userId, cancellationToken);

            return isMember || isCreator;
        }

        public async Task<TeamRole?> GetMemberRoleAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.TeamMembers
                .Where(tm => tm.TeamId == teamId && tm.UserId == userId && tm.Status == TeamMemberStatus.Accepted)
                .Select(tm => (TeamRole?)tm.Role)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
