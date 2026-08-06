// Services/TeamAuthorizationService.cs
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public class TeamAuthorizationService : ITeamAuthorizationService
{
    private readonly AppDbContext _context;

    public TeamAuthorizationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsTeamMemberOrCreatorAsync(int teamId, int userId)
    {
        var isMember = await _context.TeamMembers
            .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId);
        var isCreator = await _context.Teams
            .AnyAsync(t => t.Id == teamId && t.CreatedByUserId == userId);

        return isMember || isCreator;
    }

    public async Task<bool> CanCreateTaskForTeamAsync(int teamId, int userId)
    {
        var role = await _context.TeamMembers
            .Where(tm => tm.TeamId == teamId && tm.UserId == userId)
            .Select(tm => (TeamRole?)tm.Role)
            .FirstOrDefaultAsync();

        var isCreator = await _context.Teams
            .AnyAsync(t => t.Id == teamId && t.CreatedByUserId == userId);

        var isOwner = role == TeamRole.Owner || isCreator;
        var isAdmin = role == TeamRole.Admin;

        return isOwner || isAdmin;
    }

    public async Task<bool> CanManageTaskAsync(TaskItem task, int userId, bool isAdmin)
    {
        if (isAdmin) 
            return true;

        if (!task.TeamId.HasValue)
        {
            // Personal task: Only owner or assignee can manage
            return task.UserId == userId || task.AssignedUserId == userId;
        }

        // Team task: Admin (above), Team Creator, or Team Member can manage
        return await IsTeamMemberOrCreatorAsync(task.TeamId.Value, userId);
    }
}