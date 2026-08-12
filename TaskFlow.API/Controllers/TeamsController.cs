using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;
        private readonly ITeamAuthorizationService _authService;

        public TeamsController(ITeamService teamService, ITeamAuthorizationService authService)
        {
            _teamService = teamService;
            _authService = authService;
        }

        [HttpPost("{teamId}/members/{userId}/invite")]
        public async Task<IActionResult> InviteUser(int teamId, int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var canInvite = await _authService.CanInviteMemberAsync(teamId, currentUserId.Value);
            if (!canInvite)
                return Forbid();

            var result = await _teamService.InviteUserAsync(teamId, userId, currentUserId.Value);
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

        [HttpPost("{teamId}/invitations/accept")]
        public async Task<IActionResult> AcceptInvitation(int teamId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var result = await _teamService.AcceptInvitationAsync(teamId, currentUserId.Value);
            if (!result.Success)
            {
                if (result.Message == "NotFound") return NotFound(new { message = "Davet bulunamadı." });
                if (result.Message == "NotPending") return BadRequest(new { message = "Bu davet zaten kabul edilmiş veya reddedilmiş." });
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Davet kabul edildi." });
        }

        [HttpPost("{teamId}/invitations/reject")]
        public async Task<IActionResult> RejectInvitation(int teamId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized();

            var result = await _teamService.RejectInvitationAsync(teamId, currentUserId.Value);
            if (!result.Success)
            {
                if (result.Message == "NotFound") return NotFound(new { message = "Davet bulunamadı." });
                if (result.Message == "NotPending") return BadRequest(new { message = "Bu davet zaten kabul edilmiş veya reddedilmiş." });
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Davet reddedildi." });
        }
        // Returns all teams with UserRole populated for the calling user.
        [HttpGet]
        public async Task<IActionResult> GetTeams()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var teams = await _teamService.GetTeamsAsync(userId.Value);
            return Ok(teams);
        }

        // ── GET: api/teams/5 ───────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeam(int id)
        {
            var team = await _teamService.GetTeamAsync(id);

            if (team == null)
                return NotFound();

            return Ok(team);
        }

        // ── POST: api/teams ────────────────────────────────────────────────────
        // Creates the team and auto-assigns the caller as Owner.
        [HttpPost]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var created = await _teamService.CreateTeamAsync(dto, userId.Value);

            return CreatedAtAction(
                nameof(GetTeam),
                new { id = created.Id },
                created);
        }

        // ── PUT: api/teams/5 ───────────────────────────────────────────────────
        // Only the team Owner or Admin can update team info.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(id, userId.Value);
            if (string.IsNullOrEmpty(role) || string.Equals(role, "Member", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var updated = await _teamService.UpdateTeamAsync(id, dto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // ── DELETE: api/teams/5 ────────────────────────────────────────────────
        // Only the Owner can delete a team.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var role = await _teamService.GetUserRoleInTeamAsync(id, userId.Value);
            if (!string.Equals(role, "Owner", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            try
            {
                var deleted = await _teamService.DeleteTeamAsync(id);
                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception)
            {
                // Optionally log error
                throw;
            }
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
