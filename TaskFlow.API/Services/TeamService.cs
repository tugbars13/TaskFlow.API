using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _repository;
        private readonly AppDbContext _context;

        public TeamService(ITeamRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // ── TeamMembers ────────────────────────────────────────────────────────

        public async Task<List<TeamMemberDto>> GetAllAsync()
        {
            var members = await _repository.GetAllAsync();

            return members.Select(x => new TeamMemberDto
            {
                Id = x.Id,
                TeamId = x.TeamId,
                UserId = x.UserId,
                FullName = x.User?.FullName ?? string.Empty,
                Department = x.Team?.Name ?? "Engineering",
                Role = x.Role.ToString(),
                Workload = 0,
                ActiveProjects = 0,
                Status = "Active",
                AvatarUrl = $"https://i.pravatar.cc/150?u={x.UserId}"
            }).ToList();
        }

        public async Task<List<TeamMemberDto>> GetMembersByTeamIdAsync(int teamId)
        {
            var members = await _repository.GetMembersByTeamIdAsync(teamId);

            return members.Select(x => new TeamMemberDto
            {
                Id = x.Id,
                TeamId = x.TeamId,
                UserId = x.UserId,
                FullName = x.User?.FullName ?? string.Empty,
                Department = x.Team?.Name ?? "Engineering",
                Role = x.Role.ToString(),
                Workload = 0,
                ActiveProjects = 0,
                Status = "Active",
                AvatarUrl = $"https://i.pravatar.cc/150?u={x.UserId}"
            }).ToList();
        }

        public async Task<TeamMemberDto?> GetByIdAsync(int id)
        {
            var member = await _repository.GetByIdAsync(id);

            if (member == null)
                return null;

            return new TeamMemberDto
            {
                Id = member.Id,
                TeamId = member.TeamId,
                UserId = member.UserId,
                FullName = member.User?.FullName ?? string.Empty,
                Department = member.Team?.Name ?? "Engineering",
                Role = member.Role.ToString(),
                Workload = 0,
                ActiveProjects = 0,
                Status = "Active",
                AvatarUrl = $"https://i.pravatar.cc/150?u={member.UserId}"
            };
        }

        public async Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto)
        {
            // Validate role — guard against empty-string defaulting to Owner (enum value 0)
            if (!Enum.TryParse<TeamRole>(dto.Role, ignoreCase: true, out var parsedRole))
                parsedRole = TeamRole.Member; // safe default for incoming member adds

            var member = new TeamMember
            {
                UserId = dto.UserId > 0 ? dto.UserId : throw new ArgumentException("Invalid UserId"),
                TeamId = dto.TeamId > 0 ? dto.TeamId : throw new ArgumentException("Invalid TeamId"),
                Role = parsedRole,
                JoinedDate = DateTime.UtcNow
            };

            _context.TeamMembers.Add(member);
            await _context.SaveChangesAsync();

            // Reload with User navigation to get FullName
            await _context.Entry(member).Reference(m => m.User).LoadAsync();

            return new TeamMemberDto
            {
                Id = member.Id,
                TeamId = member.TeamId,
                UserId = member.UserId,
                FullName = member.User?.FullName ?? dto.FullName,
                Department = dto.Department,
                Role = member.Role.ToString(),
                Workload = 0,
                ActiveProjects = 0,
                Status = "Active",
                AvatarUrl = $"https://i.pravatar.cc/150?u={member.UserId}"
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateTeamMemberDto dto)
        {
            var member = await _repository.GetByIdAsync(id);

            if (member == null)
                return false;

            // Guard against demoting Owner via role update
            if (member.Role == TeamRole.Owner)
                return false;

            if (Enum.TryParse<TeamRole>(dto.Role, ignoreCase: true, out var parsedRole))
            {
                // Prevent promoting anyone to Owner via this route
                if (parsedRole == TeamRole.Owner)
                    parsedRole = TeamRole.Admin;

                member.Role = parsedRole;
            }

            await _repository.UpdateAsync(member);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var member = await _repository.GetByIdAsync(id);
            if (member == null)
                return false;

            // Never delete an Owner
            if (member.Role == TeamRole.Owner)
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        // ── Teams ──────────────────────────────────────────────────────────────

        /// <summary>
        /// Returns all teams. For each team, UserRole is the calling user's role.
        /// Legacy self-heal: if the user is the CreatedByUserId but has no Owner record,
        /// an Owner TeamMember is inserted on the fly.
        /// </summary>
        public async Task<List<TeamDto>> GetTeamsAsync(int currentUserId)
        {
            var teams = await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .Where(t => t.Members.Any(m => m.UserId == currentUserId) || t.CreatedByUserId == currentUserId)
                .ToListAsync();

            var result = new List<TeamDto>();

            foreach (var t in teams)
            {
                var membership = t.Members.FirstOrDefault(m => m.UserId == currentUserId);
                string userRole;

                if (membership != null)
                {
                    userRole = membership.Role.ToString();
                }
                else if (t.CreatedByUserId == currentUserId)
                {
                    // ── Self-Heal ──────────────────────────────────────────────
                    // Team was created before the auto-owner-insert logic existed.
                    // Insert the Owner row now so the DB is consistent going forward.
                    var ownerRecord = new TeamMember
                    {
                        TeamId = t.Id,
                        UserId = currentUserId,
                        Role = TeamRole.Owner,
                        JoinedDate = t.CreatedDate
                    };
                    _context.TeamMembers.Add(ownerRecord);
                    await _context.SaveChangesAsync();
                    userRole = TeamRole.Owner.ToString();
                }
                else
                {
                    userRole = string.Empty;
                }

                if (!string.IsNullOrEmpty(userRole))
                {
                    result.Add(new TeamDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        CreatedDate = t.CreatedDate,
                        MemberCount = t.Members.Count + (membership == null && t.CreatedByUserId == currentUserId ? 1 : 0),
                        UserRole = userRole
                    });
                }
            }

            return result;
        }

        public async Task<TeamDto?> GetTeamAsync(int id)
        {
            var team = await _repository.GetTeamAsync(id);

            if (team == null)
                return null;

            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                CreatedDate = team.CreatedDate,
                MemberCount = team.Members?.Count ?? 0
            };
        }

        /// <summary>
        /// Creates a new team and immediately inserts the creator as Owner.
        /// Both operations run within a single SaveChanges call for consistency.
        /// </summary>
        public async Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, int currentUserId)
        {
            // Step 1 — Create the Team
            var team = new Team
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                CreatedDate = DateTime.UtcNow,
                CreatedByUserId = currentUserId
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync(); // generates Team.Id

            // Step 2 — Insert the Owner TeamMember using the real Team.Id
            var ownerMember = new TeamMember
            {
                TeamId = team.Id,       // guaranteed non-zero after SaveChanges
                UserId = currentUserId,
                Role = TeamRole.Owner,
                JoinedDate = DateTime.UtcNow
            };

            _context.TeamMembers.Add(ownerMember);
            await _context.SaveChangesAsync(); // persists Owner row

            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                CreatedDate = team.CreatedDate,
                MemberCount = 1,
                UserRole = TeamRole.Owner.ToString()
            };
        }

        public async Task<bool> UpdateTeamAsync(int id, UpdateTeamDto dto)
        {
            var team = await _repository.GetTeamAsync(id);

            if (team == null)
                return false;

            team.Name = dto.Name;
            team.Description = dto.Description ?? string.Empty;

            return await _repository.UpdateTeamAsync(team);
        }

        public async Task<bool> DeleteTeamAsync(int id)
        {
            return await _repository.DeleteTeamAsync(id);
        }

        // ── Permission Helpers ─────────────────────────────────────────────────

        /// <summary>
        /// Returns the caller's role string in a given team.
        /// Falls back to "Owner" if the user is the team creator but has no member record (legacy).
        /// </summary>
        public async Task<string?> GetUserRoleInTeamAsync(int teamId, int userId)
        {
            var member = await _context.TeamMembers
                .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

            if (member != null)
                return member.Role.ToString();

            // Legacy fallback: check if caller is the team creator
            var team = await _context.Teams.FindAsync(teamId);
            if (team != null && team.CreatedByUserId == userId)
                return TeamRole.Owner.ToString();

            return null;
        }

        public async Task<TeamMemberDto?> GetMemberByTeamAndUserAsync(int teamId, int userId)
        {
            var member = await _repository.GetMemberByTeamAndUserAsync(teamId, userId);
            if (member == null) return null;

            return new TeamMemberDto
            {
                Id = member.Id,
                TeamId = member.TeamId,
                UserId = member.UserId,
                FullName = member.User?.FullName ?? string.Empty,
                Role = member.Role.ToString(),
                Status = "Active",
                AvatarUrl = $"https://i.pravatar.cc/150?u={member.UserId}"
            };
        }
    }
}