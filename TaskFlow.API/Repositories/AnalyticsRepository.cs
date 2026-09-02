using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Repositories.Results;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _context;

    public AnalyticsRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<TaskItem> GetBasicTasksQuery(int userId)
    {
        return _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && !t.IsDeleted);
    }

    private IQueryable<TaskItem> GetAdvancedTasksQuery(int userId)
    {
        return _context.Tasks
            .AsNoTracking()
            .Where(t =>
                !t.IsDeleted &&
                (
                    (t.TeamId == null && t.UserId == userId) ||
                    t.Assignees.Any(a => a.UserId == userId)
                ));
    }

    public async Task<List<DailyTrendResult>> GetDailyTrendAsync(int userId, DateTime startDate, CancellationToken cancellationToken = default)
    {
        var endDate = startDate.AddDays(7);

        var createdGroups = await GetBasicTasksQuery(userId)
            .Where(t => t.CreatedDate >= startDate && t.CreatedDate < endDate)
            .GroupBy(t => t.CreatedDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var completedGroups = await GetBasicTasksQuery(userId)
            .Where(t => t.IsCompleted && t.CompletedDate != null && t.CompletedDate >= startDate && t.CompletedDate < endDate)
            .GroupBy(t => t.CompletedDate!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var resultList = new List<DailyTrendResult>();
        for (int i = 0; i < 7; i++)
        {
            var d = startDate.AddDays(i).Date;
            var c = createdGroups.FirstOrDefault(x => x.Date == d)?.Count ?? 0;
            var comp = completedGroups.FirstOrDefault(x => x.Date == d)?.Count ?? 0;
            resultList.Add(new DailyTrendResult { Date = d, CreatedCount = c, CompletedCount = comp });
        }
        return resultList;
    }

    public async Task<int> GetActiveTaskCountAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await GetBasicTasksQuery(userId)
            .CountAsync(t => !t.IsCompleted, cancellationToken);
    }

    public async Task<int> GetOverdueTaskCountAsync(int userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await GetBasicTasksQuery(userId)
            .CountAsync(t => !t.IsCompleted && t.DueDate != null && t.DueDate < now, cancellationToken);
    }

    public async Task<List<TeamWorkloadResult>> GetTeamWorkloadsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var activeCount = await GetActiveTaskCountAsync(userId, cancellationToken);
        var overdueCount = await GetOverdueTaskCountAsync(userId, cancellationToken);

        var workloads = await _context.TeamMembers
            .AsNoTracking()
            .Select(m => new TeamWorkloadResult
            {
                UserId = m.UserId,
                FullName = m.User != null ? m.User.FullName : string.Empty,
                ActiveTasks = activeCount,
                OverdueTasks = overdueCount
            })
            .ToListAsync(cancellationToken);

        return workloads;
    }

    public async Task<CompletedTaskStatsResult> GetCompletedTaskStatsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var result = await GetAdvancedTasksQuery(userId)
            .Where(t => t.IsCompleted && t.CompletedDate != null)
            .GroupBy(x => 1)
            .Select(g => new CompletedTaskStatsResult
            {
                TotalCompleted = g.Count(),
                LateCompleted = g.Count(t => t.DueDate != null && t.CompletedDate > t.DueDate),
                OnTimeCompleted = g.Count(t => t.DueDate != null && t.CompletedDate <= t.DueDate)
            })
            .FirstOrDefaultAsync(cancellationToken);

        return result ?? new CompletedTaskStatsResult();
    }

    public async Task<double?> GetAverageCompletionDaysAsync(int userId, CancellationToken cancellationToken = default)
    {
        var avg = await GetAdvancedTasksQuery(userId)
            .Where(t => t.IsCompleted && t.CompletedDate != null)
            .AverageAsync(t => (double?)EF.Functions.DateDiffDay(t.CreatedDate, t.CompletedDate), cancellationToken);

        return avg;
    }

    public async Task<List<TaskDateProjectionResult>> GetTaskDatesForMetricsAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await GetAdvancedTasksQuery(userId)
            .Select(t => new TaskDateProjectionResult
            {
                CreatedDate = t.CreatedDate,
                CompletedDate = t.CompletedDate,
                DueDate = t.DueDate,
                CategoryId = t.CategoryId
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CategoryPerformanceResult>> GetCategoryPerformancesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var mapped = await GetAdvancedTasksQuery(userId)
            .GroupBy(t => new { t.CategoryId, CategoryName = t.Category != null ? t.Category.Name : "Bilinmeyen" })
            .Select(g => new CategoryPerformanceResult
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.CategoryName,
                TotalTasks = g.Count(),
                CompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate != null),
                AverageCompletionDays = null
            }).ToListAsync(cancellationToken);

        return mapped;
    }

    public async Task<List<PriorityPerformanceResult>> GetPriorityPerformancesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var mapped = await GetAdvancedTasksQuery(userId)
            .GroupBy(t => t.Priority)
            .Select(g => new PriorityPerformanceResult
            {
                Priority = g.Key,
                TotalTasks = g.Count(),
                CompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate != null),
                OnTimeCompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate != null && x.DueDate != null && x.CompletedDate <= x.DueDate),
                LateCompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate != null && x.DueDate != null && x.CompletedDate > x.DueDate),
                AverageCompletionDays = null
            }).ToListAsync(cancellationToken);

        return mapped;
    }
}
