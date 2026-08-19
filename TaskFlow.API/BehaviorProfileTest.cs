using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Services;
using TaskFlow.API.DTOs;
using Microsoft.Extensions.DependencyInjection;

namespace TaskFlow.API
{
    public static class BehaviorProfileTest
    {
        public static async Task RunTests(IServiceProvider sp)
        {
            using var scope = sp.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var profileService = scope.ServiceProvider.GetRequiredService<IUserBehaviorProfileService>();
            
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine("--- STARTING BEHAVIOR PROFILE TESTS ---");

                // Create a test user
                var user = new User { FullName = "Test User", Email = "testuser_behavior@example.com", PasswordHash = "x", CreatedDate = DateTime.UtcNow };
                context.Users.Add(user);
                await context.SaveChangesAsync();

                // 1. IsArchived = true, IsDeleted = false => Should be INCLUDED in Behavior Profile
                var t1 = new TaskItem { Title = "T1", UserId = user.Id, Category = TaskCategory.Work, Priority = TaskPriority.High, Status = TaskFlow.API.Models.TaskStatus.Completed, IsCompleted = true, CreatedDate = DateTime.UtcNow.AddDays(-10), CompletedDate = DateTime.UtcNow.AddDays(-8), DueDate = DateTime.UtcNow.AddDays(-9), IsArchived = true, IsDeleted = false };
                
                // 2. IsArchived = false, IsDeleted = true => Should NOT be INCLUDED
                var t2 = new TaskItem { Title = "T2", UserId = user.Id, Category = TaskCategory.Work, Priority = TaskPriority.Medium, Status = TaskFlow.API.Models.TaskStatus.Completed, IsCompleted = true, CreatedDate = DateTime.UtcNow.AddDays(-5), CompletedDate = DateTime.UtcNow.AddDays(-4), IsArchived = false, IsDeleted = true };
                
                // 3. Late task -> creates high risk
                var t3 = new TaskItem { Title = "T3", UserId = user.Id, Category = TaskCategory.Work, Priority = TaskPriority.Medium, Status = TaskFlow.API.Models.TaskStatus.Completed, IsCompleted = true, CreatedDate = DateTime.UtcNow.AddDays(-5), CompletedDate = DateTime.UtcNow.AddDays(-2), DueDate = DateTime.UtcNow.AddDays(-4), IsArchived = false, IsDeleted = false };

                context.Tasks.AddRange(t1, t2, t3);
                await context.SaveChangesAsync();

                // Calculate Profile
                var profile = await profileService.GetOrCalculateProfileAsync(user.Id);

                // Validation 1: Total Tasks should be 2 (t1 is archived but included, t2 is deleted so excluded, t3 is active and included)
                bool pass1 = profile.TotalTasks == 2;
                Console.WriteLine($"TEST 1 (Total Tasks = 2): {(pass1 ? "PASS" : "FAIL")} (Actual: {profile.TotalTasks})");

                // Validation 2: LateTasks = 2 (t1 was 1 day late, t3 was 2 days late)
                var devBehavior = profile.CategoryBehaviors.FirstOrDefault(c => c.Category == TaskCategory.Work);
                bool pass2 = devBehavior != null && devBehavior.LateTasks == 2;
                Console.WriteLine($"TEST 2 (Late Tasks = 2): {(pass2 ? "PASS" : "FAIL")} (Actual: {devBehavior?.LateTasks})");

                // Validation 3: Risk Level = YÜKSEK (since 2 late out of 2 tasks)
                bool pass3 = devBehavior != null && devBehavior.RiskLevel == "YÜKSEK";
                Console.WriteLine($"TEST 3 (Risk Level = YÜKSEK): {(pass3 ? "PASS" : "FAIL")} (Actual: {devBehavior?.RiskLevel})");

                // Validation 4: InvalidateProfile works
                var oldDate = profile.LastCalculatedAt;
                await profileService.InvalidateProfileAsync(user.Id);
                var invalidatedProfile = await context.UserBehaviorProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
                bool pass4 = invalidatedProfile != null && invalidatedProfile.LastCalculatedAt < DateTime.UtcNow.AddDays(-1);
                Console.WriteLine($"TEST 4 (Invalidate Profile): {(pass4 ? "PASS" : "FAIL")}");
                
                Console.WriteLine("--- BEHAVIOR PROFILE TESTS FINISHED ---");
            }
            finally
            {
                await transaction.RollbackAsync();
            }
        }
    }
}

