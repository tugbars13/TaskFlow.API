using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Utils;

namespace TaskFlow.API.Services
{
    public interface IUserBehaviorProfileService
    {
        Task<UserBehaviorProfile> GetOrCalculateProfileAsync(int userId);
        Task InvalidateProfileAsync(int userId);
    }

    public class UserBehaviorProfileService : IUserBehaviorProfileService
    {
        private readonly AppDbContext _context;

        public UserBehaviorProfileService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserBehaviorProfile> GetOrCalculateProfileAsync(int userId)
        {
            var profile = await _context.UserBehaviorProfiles
                .Include(p => p.CategoryBehaviors)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null || profile.LastCalculatedAt < DateTime.UtcNow.AddHours(-24))
            {
                return await CalculateAndSaveProfileAsync(userId, profile);
            }

            return profile;
        }

        public async Task InvalidateProfileAsync(int userId)
        {
            var profile = await _context.UserBehaviorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile != null)
            {
                profile.LastCalculatedAt = DateTime.UtcNow.AddDays(-10); // Force recalculation next time
                await _context.SaveChangesAsync();
            }
        }

        private async Task<UserBehaviorProfile> CalculateAndSaveProfileAsync(int userId, UserBehaviorProfile? existingProfile)
        {
            var tasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.AssignedUser)
                .Include(t => t.Assignees)
                .Include(t => t.Team)
                .Where(t =>
                    !t.IsDeleted &&
                    (
                        (t.TeamId == null && t.UserId == userId) ||
                        t.AssignedUserId == userId ||
                        t.Assignees.Any(a => a.UserId == userId)
                    ))
                .ToListAsync();

            var metrics = AnalyticsCalculator.CalculateAdvancedMetrics(tasks);

            var profile = existingProfile ?? new UserBehaviorProfile { UserId = userId, CategoryBehaviors = new List<UserCategoryBehavior>() };

            profile.TotalTasks = tasks.Count;
            profile.CompletedTasks = tasks.Count(t => t.IsCompleted);
            profile.LateTasks = metrics.CategoryPerformances?.Sum(c => c.LateTasks) ?? 0;
            profile.ProcrastinatedTasks = metrics.CategoryPerformances?.Sum(c => c.ProcrastinatedTasks) ?? 0;
            profile.OnTimeCompletionRate = metrics.OnTimeCompletionRate;
            profile.AverageCompletionDays = metrics.OverallAverageCompletionDays ?? 0;
            profile.CurrentOverdueTasks = metrics.ActiveOverdueTasks;
            profile.LastCalculatedAt = DateTime.UtcNow;

            if (metrics.CategoryPerformances != null)
            {
                foreach (var catPerf in metrics.CategoryPerformances)
                {
                    if (!Enum.TryParse<TaskCategory>(catPerf.CategoryName, out var categoryEnum))
                        continue;

                    var catBehavior = profile.CategoryBehaviors.FirstOrDefault(c => c.Category == categoryEnum);
                    if (catBehavior == null)
                    {
                        catBehavior = new UserCategoryBehavior { Category = categoryEnum };
                        profile.CategoryBehaviors.Add(catBehavior);
                    }

                    catBehavior.TotalTasks = catPerf.TotalTasks;
                    catBehavior.CompletedTasks = catPerf.CompletedTasks;
                    catBehavior.LateTasks = catPerf.LateTasks;
                    catBehavior.ProcrastinatedTasks = catPerf.ProcrastinatedTasks;
                    
                    if (catPerf.CompletedTasks > 0)
                    {
                        var onTime = catPerf.CompletedTasks - catPerf.LateTasks;
                        catBehavior.OnTimeCompletionRate = (onTime / (double)catPerf.CompletedTasks) * 100;
                    }
                    else
                    {
                        catBehavior.OnTimeCompletionRate = 0;
                    }

                    var lateRate = catPerf.TotalTasks > 0 ? (double)catPerf.LateTasks / catPerf.TotalTasks : 0;
                    var procRate = catPerf.TotalTasks > 0 ? (double)catPerf.ProcrastinatedTasks / catPerf.TotalTasks : 0;

                    if (lateRate > 0.3 || procRate > 0.3 || catPerf.LateTasks > 1 || catPerf.ProcrastinatedTasks > 1)
                        catBehavior.RiskLevel = "YÜKSEK";
                    else if (lateRate > 0.1 || procRate > 0.1 || catPerf.LateTasks > 0 || catPerf.ProcrastinatedTasks > 0)
                        catBehavior.RiskLevel = "ORTA";
                    else
                        catBehavior.RiskLevel = "DÜŞÜK";

                    catBehavior.LastCalculatedAt = DateTime.UtcNow;
                }
            }

            if (existingProfile == null)
            {
                _context.UserBehaviorProfiles.Add(profile);
            }
            else
            {
                _context.UserBehaviorProfiles.Update(profile);
            }

            await _context.SaveChangesAsync();

            return profile;
        }
    }
}
