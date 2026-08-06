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
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        // ── GET: api/Team ─────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var members = await _teamService.GetAllAsync();
            return Ok(members);
        }

        // ── GET: api/Team/team/5 ──────────────────────────────────────────────
        [HttpGet("team/{teamId}")]
        public async Task<IActionResult> GetByTeamId(int teamId)
        {
            var members = await _teamService.GetMembersByTeamIdAsync(teamId);
            return Ok(members);
        }

        // ── GET: api/Team/5 ───────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _teamService.GetByIdAsync(id);

            if (member == null)
                return NotFound();

            return Ok(member);
        }

        // ── POST: api/Team ─────────────────────────────────────────────────────
        // Add Member — only Owner or Admin of the target team may do this.
        [HttpPost]
        public async Task<IActionResult> Create(CreateTeamMemberDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            // Resolve caller's role in the target team
            var callerRole = await _teamService.GetUserRoleInTeamAsync(dto.TeamId, userId.Value);

            if (string.IsNullOrEmpty(callerRole) ||
                string.Equals(callerRole, "Member", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = "Only team Owners and Admins can add members." });
            }

            var member = await _teamService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = member.Id },
                member);
        }

        // ── PUT: api/Team/5 ───────────────────────────────────────────────────
        // Change Role — only the team Owner may change another member's role.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTeamMemberDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            // Fetch the target member to determine their team
            var targetMember = await _teamService.GetByIdAsync(id);
            if (targetMember == null)
                return NotFound();

            // Prevent changing an Owner's role
            if (string.Equals(targetMember.Role, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "The team Owner's role cannot be changed." });

            // Only Owner may change roles
            var callerRole = await _teamService.GetUserRoleInTeamAsync(targetMember.TeamId, userId.Value);
            if (!string.Equals(callerRole, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Only the team Owner can change member roles." });

            var updated = await _teamService.UpdateAsync(id, dto);

            if (!updated)
                return NotFound();

            return NoContent();
        }

        // ── DELETE: api/Team/5 ────────────────────────────────────────────────
        // Remove Member — only the team Owner may remove members. Owner cannot be removed.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            // Fetch the target member
            var targetMember = await _teamService.GetByIdAsync(id);
            if (targetMember == null)
                return NotFound();

            // Prevent removing an Owner
            if (string.Equals(targetMember.Role, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "The team Owner cannot be removed." });

            // Only Owner may remove members
            var callerRole = await _teamService.GetUserRoleInTeamAsync(targetMember.TeamId, userId.Value);
            if (!string.Equals(callerRole, "Owner", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Only the team Owner can remove members." });

            var deleted = await _teamService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // ── Helper ────────────────────────────────────────────────────────────
        private int? GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(claim, out var id))
                return id;
            return null;
        }
    }
}