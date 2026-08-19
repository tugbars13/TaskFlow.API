using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Services;
using TaskFlow.API.DTOs;
using TaskFlow.API.DTOs.Team;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

namespace TaskFlow.API
{
    public static class SnapshotTest
    {
        public static async Task RunTests(IServiceProvider sp)
        {
            using var scope = sp.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            // Note: Since TeamAnalyticsService depends on IAiService which might require API keys etc.,
            // we will simulate the behavior here by manually querying and creating,
            // or just by calling the service with a mocked user if possible.
            // Let's just create a manual snapshot and verify the lookup works.
            
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine("--- STARTING SNAPSHOT TESTS ---");

                // Create a test user and team
                var user = new User { FullName = "Snapshot User", Email = "snapuser@example.com", PasswordHash = "x", CreatedDate = DateTime.UtcNow };
                context.Users.Add(user);
                await context.SaveChangesAsync();
                
                var team = new Team { Name = "Snapshot Team", Description = "Test", CreatedDate = DateTime.UtcNow, CreatedByUserId = user.Id };
                context.Teams.Add(team);
                await context.SaveChangesAsync();

                var now = DateTime.UtcNow;
                var startDate = now.Date;
                var endDate = startDate.AddDays(1).AddTicks(-1);

                // Create a fake snapshot
                var snapshot = new TeamAnalyticsSnapshot
                {
                    TeamId = team.Id,
                    PeriodType = "daily",
                    StartDate = startDate,
                    EndDate = endDate,
                    MemberCount = 5,
                    CompletedTasks = 10,
                    InProgressTasks = 2,
                    OverdueTasks = 1,
                    CompletionRate = 80,
                    PreviousPeriodCompletionRate = 70,
                    ProgressTrendJson = JsonSerializer.Serialize(new List<ProgressTrendDto> { new ProgressTrendDto { Label = "10:00", CompletionRate = 50 } }),
                    ActiveMembersJson = "[]",
                    OverdueTasksListJson = "[]",
                    AiSummary = "Fake AI Summary",
                    CreatedAt = DateTime.UtcNow
                };
                context.TeamAnalyticsSnapshots.Add(snapshot);
                
                // Add an old snapshot for cleanup test
                var oldSnapshot = new TeamAnalyticsSnapshot
                {
                    TeamId = team.Id,
                    PeriodType = "monthly",
                    StartDate = startDate.AddMonths(-15),
                    EndDate = endDate.AddMonths(-14),
                    AiSummary = "Old",
                    CreatedAt = DateTime.UtcNow.AddMonths(-13) // Older than 1 year
                };
                context.TeamAnalyticsSnapshots.Add(oldSnapshot);

                await context.SaveChangesAsync();

                // Test 1: Fetch using existing query logic
                var existingSnapshot = await context.TeamAnalyticsSnapshots
                    .FirstOrDefaultAsync(s => s.TeamId == team.Id 
                                         && s.PeriodType == "daily" 
                                         && s.StartDate == startDate 
                                         && s.EndDate == endDate);

                bool pass1 = existingSnapshot != null && existingSnapshot.CompletionRate == 80;
                Console.WriteLine($"TEST 1 (Snapshot Hit): {(pass1 ? "PASS" : "FAIL")}");

                // Test 2: Verify cleanup logic
                var oneYearAgo = DateTime.UtcNow.AddYears(-1);
                var snapshotsToDelete = await context.TeamAnalyticsSnapshots
                    .Where(s => s.CreatedAt < oneYearAgo)
                    .ToListAsync();
                
                bool pass2 = snapshotsToDelete.Count == 1 && snapshotsToDelete[0].Id == oldSnapshot.Id;
                Console.WriteLine($"TEST 2 (Snapshot Cleanup Detection): {(pass2 ? "PASS" : "FAIL")}");

                Console.WriteLine("--- SNAPSHOT TESTS FINISHED ---");
            }
            finally
            {
                await transaction.RollbackAsync();
            }
        }
    }
}
