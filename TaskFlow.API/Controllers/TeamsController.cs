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

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        // ── GET: api/teams ─────────────────────────────────────────────────────
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
            catch (InvalidOperationException ex) when (ex.Message == "HasTasks")
            {
                return StatusCode(StatusCodes.Status409Conflict, new { message = "This team still contains tasks and cannot be deleted." });
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
