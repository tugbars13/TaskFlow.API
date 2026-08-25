using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Utils;

namespace TaskFlow.API.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _context;

    public AnalyticsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId)
    {
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .ToListAsync();

        var teamMembers = await _context.TeamMembers
            .AsNoTracking()
            .Include(m => m.User)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
        var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        var completionTrend = new List<CompletionTrendItemDto>();

        for (int i = 0; i < 7; i++)
        {
            var dayDate = startOfWeek.AddDays(i);

            var createdCount = tasks.Count(t => t.CreatedDate.Date == dayDate);

            var completedCount = tasks.Count(t =>
                t.IsCompleted &&
                (t.CompletedDate.HasValue
                    ? t.CompletedDate.Value.Date == dayDate
                    : t.CreatedDate.Date == dayDate));

            completionTrend.Add(new CompletionTrendItemDto
            {
                Date = dayDate.ToString("yyyy-MM-dd"),
                Day = days[i],
                Created = createdCount,
                Completed = completedCount
            });
        }

        var teamWorkload = teamMembers.Select(m => new TeamWorkloadMemberDto
        {
            Id = m.Id,
            FullName = m.User?.FullName ?? string.Empty,
            AvatarUrl = $"https://i.pravatar.cc/150?u={m.UserId}",
            Workload = 0,
            ActiveTasks = tasks.Count(t => !t.IsCompleted),
            OverdueTasks = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow)
        }).ToList();

        return new AnalyticsDto
        {
            TimeRange = "7d",
            CompletionTrend = completionTrend,
            TeamWorkload = teamWorkload
        };
    }

    public async Task<AiInsightDataDto> GetAdvancedAnalyticsDataAsync(int userId)
    {
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Assignees)
            .Include(t => t.Team)
            .Where(t =>
                !t.IsDeleted &&
                (
                    (t.TeamId == null && t.UserId == userId) ||
                    t.Assignees.Any(a => a.UserId == userId)
                ))
            .ToListAsync();

        return AnalyticsCalculator.CalculateAdvancedMetrics(tasks);
    }
}

