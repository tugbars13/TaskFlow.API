using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.DTOs;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/teams")]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;
        private readonly ITeamAuthorizationService _authService;
        private readonly ITeamAnalyticsService _teamAnalyticsService;

        public TeamsController(ITeamService teamService, ITeamAuthorizationService authService, ITeamAnalyticsService teamAnalyticsService)
        {
            _teamService = teamService;
            _authService = authService;
            _teamAnalyticsService = teamAnalyticsService;
        }

        // ── GET: api/teams ─────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetTeams([FromQuery] PaginationDto pagination, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var teams = await _teamService.GetTeamsAsync(userId.Value, pagination, cancellationToken);
            return Ok(teams);
        }

        // ── GET: api/teams/5 ───────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeam(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var isAuthorized = await _authService.IsTeamMemberOrCreatorAsync(id, userId.Value);
            if (!isAuthorized)
                return NotFound();

            var team = await _teamService.GetTeamAsync(id, cancellationToken);

            if (team == null)
                return NotFound();

            return Ok(team);
        }

        // ── POST: api/teams ────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var created = await _teamService.CreateTeamAsync(dto, userId.Value, cancellationToken);

            return CreatedAtAction(
                nameof(GetTeam),
                new { id = created.Id },
                created);
        }

        // ── PUT: api/teams/5 ───────────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(id, userId.Value, cancellationToken);
            if (string.IsNullOrEmpty(role) || string.Equals(role, "Member", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var updated = await _teamService.UpdateTeamAsync(id, dto, cancellationToken);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // ── DELETE: api/teams/5 ────────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeam(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(id, userId.Value, cancellationToken);
            if (!string.Equals(role, "Owner", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var deleted = await _teamService.DeleteTeamAsync(id, cancellationToken);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // ── GET: api/teams/{teamId}/members ────────────────────────────────────
        [HttpGet("{teamId}/members")]
        public async Task<IActionResult> GetMembers(int teamId, [FromQuery] PaginationDto pagination, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(teamId, userId.Value, cancellationToken);
            if (string.IsNullOrEmpty(role))
                return NotFound();

            var members = await _teamService.GetMembersByTeamIdAsync(teamId, pagination, cancellationToken);
            return Ok(members);
        }

        // ── POST: api/teams/{teamId}/members ───────────────────────────────────
        [HttpPost("{teamId}/members")]
        public async Task<IActionResult> AddMember(int teamId, [FromBody] CreateTeamMemberDto dto, CancellationToken cancellationToken)
        {
            if (teamId != dto.TeamId)
            {
                return BadRequest(new { message = "Team ID in URL does not match Team ID in body." });
            }

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var callerRole = await _teamService.GetUserRoleInTeamAsync(teamId, userId.Value, cancellationToken);

            if (string.IsNullOrEmpty(callerRole) ||
                string.Equals(callerRole, "Member", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Only team Owners and Admins can add members." });
            }

            var member = await _teamService.CreateAsync(dto, userId.Value, cancellationToken);

            return CreatedAtAction(
                nameof(GetTeam),
                new { id = member.TeamId },
                member);
        }

        // ── PUT: api/teams/{teamId}/members/{memberId} ─────────────────────────
        [HttpPut("{teamId}/members/{memberId}")]
        public async Task<IActionResult> UpdateMemberRole(int teamId, int memberId, [FromBody] UpdateTeamMemberDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var targetMember = await _teamService.GetByIdAsync(memberId, cancellationToken);
            if (targetMember == null || targetMember.TeamId != teamId)
                return NotFound();

            if (string.Equals(targetMember.Role, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "The team Owner's role cannot be changed." });

            var callerRole = await _teamService.GetUserRoleInTeamAsync(teamId, userId.Value, cancellationToken);
            if (!string.Equals(callerRole, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Only the team Owner can change member roles." });

            var updated = await _teamService.UpdateAsync(memberId, dto, cancellationToken);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // ── DELETE: api/teams/{teamId}/members/{memberId} ──────────────────────
        [HttpDelete("{teamId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int teamId, int memberId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var targetMember = await _teamService.GetByIdAsync(memberId, cancellationToken);
            if (targetMember == null || targetMember.TeamId != teamId)
                return NotFound();

            if (string.Equals(targetMember.Role, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "The team Owner cannot be removed." });

            var callerRole = await _teamService.GetUserRoleInTeamAsync(teamId, userId.Value, cancellationToken);
            if (!string.Equals(callerRole, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Only the team Owner can remove members." });

            var deleted = await _teamService.DeleteAsync(memberId, cancellationToken);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // ── POST: api/teams/{teamId}/members/{userId}/invite ───────────────────
        [HttpPost("{teamId}/members/{userId}/invite")]
        public async Task<IActionResult> InviteUser(int teamId, int userId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var canInvite = await _authService.CanInviteMemberAsync(teamId, currentUserId.Value);
            if (!canInvite)
                return Forbid();

            var result = await _teamService.InviteUserAsync(teamId, userId, currentUserId.Value, cancellationToken);
            if (!result.Success)
            {
                if (result.Message == "UserNotFound") return NotFound();
                if (result.Message == "CannotInviteSelf") return BadRequest(new { message = "Kendinizi takıma davet edemezsiniz." });
                if (result.Message == "AlreadyMember") return Conflict(new { message = "Kullanıcı zaten bu takımın bir üyesi." });
                if (result.Message == "AlreadyInvited") return Conflict(new { message = "Kullanıcıya zaten bekleyen bir davet gönderilmiş." });
                return BadRequest(new { message = result.Message });
            }

            return StatusCode(StatusCodes.Status201Created, new { message = "Kullanıcı davet edildi." });
        }

        // ── POST: api/teams/{teamId}/invitations/accept ────────────────────────
        [HttpPost("{teamId}/invitations/accept")]
        public async Task<IActionResult> AcceptInvitation(int teamId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var result = await _teamService.AcceptInvitationAsync(teamId, currentUserId.Value, cancellationToken);
            if (!result.Success)
            {
                if (result.Message == "NotFound") return NotFound(new { message = "Davet bulunamadı." });
                if (result.Message == "NotPending") return BadRequest(new { message = "Bu davet zaten kabul edilmiş veya reddedilmiş." });
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Davet kabul edildi." });
        }

        // ── GET: api/teams/{teamId}/invitable-users ────────────────────────────
        [HttpGet("{teamId}/invitable-users")]
        public async Task<IActionResult> GetInvitableUsers(int teamId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var users = await _teamService.GetInvitableUsersAsync(teamId, currentUserId.Value, cancellationToken);
            return Ok(users);
        }

        // ── POST: api/teams/{teamId}/invitations/reject ────────────────────────
        [HttpPost("{teamId}/invitations/reject")]
        public async Task<IActionResult> RejectInvitation(int teamId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var result = await _teamService.RejectInvitationAsync(teamId, currentUserId.Value, cancellationToken);
            if (!result.Success)
            {
                if (result.Message == "NotFound") return NotFound(new { message = "Davet bulunamadı." });
                if (result.Message == "NotPending") return BadRequest(new { message = "Bu davet zaten kabul edilmiş veya reddedilmiş." });
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Davet reddedildi." });
        }

        // ── GET: api/teams/{teamId}/analytics ──────────────────────────────────
        [HttpGet("{teamId}/analytics")]
        public async Task<IActionResult> GetTeamAnalytics(int teamId, CancellationToken cancellationToken, [FromQuery] string period = "daily", [FromQuery] DateTime? date = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(teamId, userId.Value, cancellationToken);
            if (string.IsNullOrEmpty(role))
                return Forbid();

            if (!string.Equals(role, "Owner", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var analytics = await _teamAnalyticsService.GetTeamAnalyticsAsync(teamId, period, userId.Value, date, cancellationToken);
            return Ok(new TaskFlow.API.Responses.ApiResponse<TaskFlow.API.DTOs.Team.TeamAnalyticsDto>
            {
                Success = true,
                Message = "Takım analizi başarıyla getirildi.",
                Data = analytics
            });
        }

        // ── Helper ─────────────────────────────────────────────────────────────
        private int? GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(claim, out var id))
                return id;
            return null;
        }
    }
}
