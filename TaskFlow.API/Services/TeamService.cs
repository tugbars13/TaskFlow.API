using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using TaskFlow.API.DTOs;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _repository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly INotificationService _notificationService;
        private readonly ITaskRepository _taskRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TeamService(
            ITeamRepository repository,
            IUserRepository userRepository,
            INotificationRepository notificationRepository,
            INotificationService notificationService,
            ITaskRepository taskRepository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _userRepository = userRepository;
            _notificationRepository = notificationRepository;
            _notificationService = notificationService;
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<(bool Success, string Message)> InviteUserAsync(int teamId, int userIdToInvite, int currentUserId, CancellationToken cancellationToken = default)
        {
            var userExists = await _userRepository.ExistsAsync(userIdToInvite, cancellationToken);
            if (!userExists) return (false, "UserNotFound");

            if (userIdToInvite == currentUserId) return (false, "CannotInviteSelf");

            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var existingMember = await _repository.GetMemberByTeamAndUserAsync(teamId, userIdToInvite, cancellationToken);
                if (existingMember != null)
                {
                    if (existingMember.Status == TeamMemberStatus.Accepted) return (false, "AlreadyMember");
                    if (existingMember.Status == TeamMemberStatus.Pending) return (false, "AlreadyInvited");
                    if (existingMember.Status == TeamMemberStatus.Rejected)
                    {
                        existingMember.Status = TeamMemberStatus.Pending;
                        await _repository.UpdateAsync(existingMember, cancellationToken);
                    }
                }
                else
                {
                    var newMember = new TeamMember
                    {
                        TeamId = teamId,
                        UserId = userIdToInvite,
                        Role = TeamRole.Member,
                        Status = TeamMemberStatus.Pending,
                        JoinedDate = DateTime.UtcNow
                    };
                    await _repository.AddAsync(newMember, cancellationToken);
                }

                var team = await _repository.GetTeamAsync(teamId, cancellationToken);
                var sender = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
                if (team != null && sender != null)
                {
                    var oldNotifications = await _notificationRepository.GetUnreadTeamInvitationsAsync(userIdToInvite, teamId, cancellationToken);

                    foreach (var oldNotif in oldNotifications)
                    {
                        oldNotif.IsRead = true;
                        await _notificationRepository.UpdateAsync(oldNotif, cancellationToken);
                    }

                    await _notificationService.SendNotificationAsync(
                        userIdToInvite,
                        "Yeni Takım Daveti",
                        $"{sender.FullName} sizi {team.Name} grubuna davet etti.",
                        type: "TeamInvitation",
                        relatedId: teamId,
                        saveChanges: false,
                        cancellationToken: cancellationToken);
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return (true, "Success");
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }

        public async Task<(bool Success, string Message)> AcceptInvitationAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetMemberByTeamAndUserAsync(teamId, userId, cancellationToken);

            if (member == null)
                return (false, "NotFound");

            if (member.Status != TeamMemberStatus.Pending)
                return (false, "NotPending");

            member.Status = TeamMemberStatus.Accepted;
            await _repository.UpdateAsync(member, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return (true, "Success");
        }

        public async Task<(bool Success, string Message)> RejectInvitationAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetMemberByTeamAndUserAsync(teamId, userId, cancellationToken);

            if (member == null)
                return (false, "NotFound");

            if (member.Status != TeamMemberStatus.Pending)
                return (false, "NotPending");

            member.Status = TeamMemberStatus.Rejected;
            await _repository.UpdateAsync(member, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return (true, "Success");
        }

        // ── TeamMembers ────────────────────────────────────────────────────────

        public async Task<List<TeamMemberDto>> GetAllAsync(int currentUserId, CancellationToken cancellationToken = default)
        {
            var userTeams = await _repository.GetTeamsByUserIdAsync(currentUserId, 1, int.MaxValue, cancellationToken);
            var teamIds = userTeams.Select(t => t.Id).ToList();

            var members = await _repository.GetMembersByTeamIdsAsync(teamIds, cancellationToken);

            return members.Where(x => x.Status == TeamMemberStatus.Accepted).Select(x => new TeamMemberDto
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

        public async Task<List<TeamMemberDto>> GetMembersByTeamIdAsync(int teamId, PaginationDto pagination, CancellationToken cancellationToken = default)
        {
            int pageNumber = pagination?.PageNumber > 0 ? pagination.PageNumber : 1;
            int pageSize = pagination?.PageSize > 0 ? pagination.PageSize : 50;
            if (pageSize > 100) pageSize = 100;

            var members = await _repository.GetMembersByTeamIdAsync(teamId, pageNumber, pageSize, cancellationToken);

            return members.Where(x => x.Status == TeamMemberStatus.Accepted).Select(x => new TeamMemberDto
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

        public async Task<TeamMemberDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetByIdAsync(id, cancellationToken);

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

        public async Task<TeamMemberDto> CreateAsync(CreateTeamMemberDto dto, int userId, CancellationToken cancellationToken = default)
        {
            if (!Enum.TryParse<TeamRole>(dto.Role, ignoreCase: true, out var parsedRole))
                parsedRole = TeamRole.Member;

            if (parsedRole == TeamRole.Owner)
            {
                parsedRole = TeamRole.Member;
            }

            var member = new TeamMember
            {
                TeamId = dto.TeamId,
                UserId = dto.UserId,
                Role = parsedRole,
                Status = TeamMemberStatus.Pending,
                JoinedDate = DateTime.UtcNow
            };

            await _repository.AddAsync(member, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(member.Id, cancellationToken) ?? new TeamMemberDto();
        }

        public async Task<bool> UpdateAsync(int id, UpdateTeamMemberDto dto, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetByIdAsync(id, cancellationToken);

            if (member == null)
                return false;

            if (member.Role == TeamRole.Owner)
                return false;

            if (Enum.TryParse<TeamRole>(dto.Role, ignoreCase: true, out var parsedRole))
            {
                if (parsedRole == TeamRole.Owner)
                    parsedRole = TeamRole.Admin;

                member.Role = parsedRole;
            }

            await _repository.UpdateAsync(member, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            await _repository.DeleteAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ── Teams ──────────────────────────────────────────────────────────────

        public async Task<List<TeamDto>> GetTeamsAsync(int currentUserId, PaginationDto pagination, CancellationToken cancellationToken = default)
        {
            int pageNumber = pagination?.PageNumber > 0 ? pagination.PageNumber : 1;
            int pageSize = pagination?.PageSize > 0 ? pagination.PageSize : 50;
            if (pageSize > 100) pageSize = 100;

            var teams = await _repository.GetTeamsByUserIdAsync(currentUserId, pageNumber, pageSize, cancellationToken);
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
                    // No side effect allowed here during GET. Just map the role for the UI.
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

        public async Task<TeamDto?> GetTeamAsync(int id, CancellationToken cancellationToken = default)
        {
            var team = await _repository.GetTeamAsync(id, cancellationToken);

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

        public async Task<TeamDto> CreateTeamAsync(CreateTeamDto dto, int currentUserId, CancellationToken cancellationToken = default)
        {
            var team = new Team
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                CreatedDate = DateTime.UtcNow,
                CreatedByUserId = currentUserId,
                Members = new List<TeamMember>
                {
                    new TeamMember
                    {
                        UserId = currentUserId,
                        Role = TeamRole.Owner,
                        JoinedDate = DateTime.UtcNow
                    }
                }
            };

            await _repository.CreateTeamAsync(team, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

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

        public async Task<bool> UpdateTeamAsync(int id, UpdateTeamDto dto, CancellationToken cancellationToken = default)
        {
            var team = await _repository.GetTeamAsync(id, cancellationToken);

            if (team == null)
                return false;

            team.Name = dto.Name;
            team.Description = dto.Description ?? string.Empty;

            var result = await _repository.UpdateTeamAsync(team, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return result;
        }

        public async Task<bool> DeleteTeamAsync(int id, CancellationToken cancellationToken = default)
        {
            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Orchestration: Safely delete all tasks associated with this team
                await _taskRepository.DeleteTasksByTeamIdAsync(id, cancellationToken);

                // Orchestration: Clean up related team invitations
                await _notificationRepository.DeleteTeamInvitationsAsync(id, cancellationToken);

                var deleted = await _repository.DeleteTeamAsync(id, cancellationToken);
                if (!deleted)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return false;
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                return true;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }

        // ── Permission Helpers ─────────────────────────────────────────────────

        /// <summary>
        /// Returns the caller's role string in a given team.
        /// Falls back to "Owner" if the user is the team creator but has no member record (legacy).
        /// </summary>
        public async Task<string?> GetUserRoleInTeamAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetMemberByTeamAndUserAsync(teamId, userId, cancellationToken);

            if (member != null && member.Status == TeamMemberStatus.Accepted)
                return member.Role.ToString();

            // Legacy fallback: check if caller is the team creator
            var team = await _repository.GetTeamAsync(teamId, cancellationToken);
            if (team != null && team.CreatedByUserId == userId)
                return TeamRole.Owner.ToString();

            return null;
        }

        public async Task<TeamMemberDto?> GetMemberByTeamAndUserAsync(int teamId, int userId, CancellationToken cancellationToken = default)
        {
            var member = await _repository.GetMemberByTeamAndUserAsync(teamId, userId, cancellationToken);
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

        public async Task<List<UserDto>> GetInvitableUsersAsync(int teamId, int currentUserId, CancellationToken cancellationToken = default)
        {
            var invitableUsers = await _userRepository.GetInvitableUsersForTeamAsync(teamId, currentUserId, cancellationToken);

            return invitableUsers.Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                DisplayName = u.DisplayName,
                FirstName = "",
                LastName = ""
            }).ToList();
        }
    }
}