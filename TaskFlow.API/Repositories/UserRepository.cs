// Repositories/UserRepository.cs
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email);
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
    public async Task<List<User>> GetAllAsync() // BU METOT EKLENDİ
    {
        return await _context.Users.AsNoTracking().ToListAsync();
    }

    public async Task DeleteUserWithRelationsAsync(int userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return;
            }

            // 1. TaskItem (AssignedUserId) - Restrict
            var assignedTasks = await _context.Tasks.Where(t => t.AssignedUserId == userId).ToListAsync();
            foreach (var task in assignedTasks)
            {
                task.AssignedUserId = null;
            }

            // 2. TaskAssignee - Restrict
            var taskAssignees = await _context.TaskAssignees.Where(ta => ta.UserId == userId).ToListAsync();
            _context.TaskAssignees.RemoveRange(taskAssignees);

            // 3. ActivityLog - Explicit cleanup to avoid cascade path issues
            var activityLogs = await _context.ActivityLogs.Where(a => a.UserId == userId).ToListAsync();
            _context.ActivityLogs.RemoveRange(activityLogs);

            // 4. Notification - Explicit cleanup
            var notifications = await _context.Notifications.Where(n => n.UserId == userId).ToListAsync();
            _context.Notifications.RemoveRange(notifications);

            // 5. TeamMember - Explicit cleanup
            var teamMembers = await _context.TeamMembers.Where(tm => tm.UserId == userId).ToListAsync();
            _context.TeamMembers.RemoveRange(teamMembers);

            // 6. TaskItem (Owned) - Explicit cleanup
            var ownedTasks = await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();
            _context.Tasks.RemoveRange(ownedTasks);

            // Finally remove the user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}