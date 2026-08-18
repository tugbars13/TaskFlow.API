using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;

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
        var completedTasks = tasks.Where(t => t.IsCompleted && t.CompletedDate.HasValue).ToList();

        // Calculate Medians and Averages
        double? CalculateMedian(IEnumerable<double> values)
        {
            var sortedList = values.OrderBy(n => n).ToList();
            int count = sortedList.Count;
            if (count == 0) return null;
            if (count % 2 == 0)
                return (sortedList[count / 2 - 1] + sortedList[count / 2]) / 2.0;
            return sortedList[count / 2];
        }

        var completionDays = completedTasks
            .Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays)
            .ToList();

        var overallAverage = completionDays.Any() ? completionDays.Average() : (double?)null;
        var overallMedian = CalculateMedian(completionDays);

        // Category Analysis
        var categoryPerformances = new List<CategoryPerformanceDto>();
        var groupedByCategory = tasks.GroupBy(t => t.Category);

        foreach (var group in groupedByCategory)
        {
            var catCompleted = group.Where(t => t.IsCompleted && t.CompletedDate.HasValue).ToList();
            var catDays = catCompleted.Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays).ToList();
            
            var catDto = new CategoryPerformanceDto
            {
                CategoryName = group.Key.ToString(),
                TotalTasks = group.Count(),
                CompletedTasks = catCompleted.Count,
                AverageCompletionDays = catDays.Any() ? catDays.Average() : null,
                MedianCompletionDays = CalculateMedian(catDays),
                EarlyTasks = 0,
                NormalTasks = 0,
                NearingDeadlineTasks = 0,
                ProcrastinatedTasks = 0,
                LateTasks = 0
            };

            foreach (var t in catCompleted)
            {
                if (t.DueDate.HasValue)
                {
                    var totalAvailableDuration = (t.DueDate.Value - t.CreatedDate).TotalDays;
                    var actualDuration = (t.CompletedDate!.Value - t.CreatedDate).TotalDays;
                    
                    if (totalAvailableDuration > 0)
                    {
                        var ratio = actualDuration / totalAvailableDuration;
                        if (ratio <= 0.40) catDto.EarlyTasks++;
                        else if (ratio <= 0.70) catDto.NormalTasks++;
                        else if (ratio <= 0.90) catDto.NearingDeadlineTasks++;
                        else if (ratio <= 1.00) catDto.ProcrastinatedTasks++;
                        else catDto.LateTasks++; // ratio > 1.0
                    }
                    else if (totalAvailableDuration <= 0 && actualDuration > 0)
                    {
                        // Created after or on due date, and completed later -> technically late
                        catDto.LateTasks++;
                    }
                }
            }
            categoryPerformances.Add(catDto);
        }

        // Priority Analysis
        var priorityPerformances = tasks.GroupBy(t => t.Priority).Select(group => {
            var pCompleted = group.Where(t => t.IsCompleted && t.CompletedDate.HasValue).ToList();
            var pDays = pCompleted.Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays).ToList();
            
            var onTimeCompleted = pCompleted.Count(t => t.DueDate.HasValue && t.CompletedDate <= t.DueDate.Value);
            var lateCompleted = pCompleted.Count(t => t.DueDate.HasValue && t.CompletedDate > t.DueDate.Value);
            var totalWithDueDate = onTimeCompleted + lateCompleted;
            
            double? onTimeRate = null;
            if (totalWithDueDate > 0)
            {
                onTimeRate = (onTimeCompleted / (double)totalWithDueDate) * 100;
            }

            return new PriorityPerformanceDto
            {
                PriorityName = group.Key.ToString(),
                TotalTasks = group.Count(),
                CompletedTasks = pCompleted.Count,
                OnTimeCompletedTasks = onTimeCompleted,
                LateCompletedTasks = lateCompleted,
                OnTimeCompletionRate = onTimeRate,
                AverageCompletionDays = pDays.Any() ? pDays.Average() : null
            };
        }).ToList();

        var fastestCat = categoryPerformances.Where(c => c.AverageCompletionDays.HasValue).OrderBy(c => c.AverageCompletionDays).FirstOrDefault();
        var slowestCat = categoryPerformances.Where(c => c.AverageCompletionDays.HasValue).OrderByDescending(c => c.AverageCompletionDays).FirstOrDefault();

        // Overdue & On-Time Rate
        var totalWithDueDateCompleted = completedTasks.Count(t => t.DueDate.HasValue);
        var overdueCompleted = completedTasks.Count(t => t.DueDate.HasValue && t.CompletedDate > t.DueDate);
        var activeOverdue = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow);
        var onTimeRate = totalWithDueDateCompleted > 0 ? ((totalWithDueDateCompleted - overdueCompleted) / (double)totalWithDueDateCompleted) * 100 : 0;

        // Weekly Comparisons
        var now = DateTime.UtcNow;
        var startOfCurrentWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
        var daysIntoWeek = (now - startOfCurrentWeek).TotalDays;
        
        var startOfPreviousWeek = startOfCurrentWeek.AddDays(-7);
        var endOfPreviousWeekSamePeriod = startOfPreviousWeek.AddDays(daysIntoWeek);

        var currentWeekCompleted = completedTasks.Count(t => t.CompletedDate >= startOfCurrentWeek && t.CompletedDate <= now);
        var previousWeekSamePeriodCompleted = completedTasks.Count(t => t.CompletedDate >= startOfPreviousWeek && t.CompletedDate <= endOfPreviousWeekSamePeriod);

        double? wowChange = null;
        if (previousWeekSamePeriodCompleted > 0)
            wowChange = ((currentWeekCompleted - previousWeekSamePeriodCompleted) / (double)previousWeekSamePeriodCompleted) * 100;
        else if (currentWeekCompleted > 0)
            wowChange = 100;

        // Last 8 weeks trend
        var last8WeeksTrend = new List<WeeklyAggregateDto>();
        for (int i = 7; i >= 0; i--)
        {
            var weekStart = startOfCurrentWeek.AddDays(-7 * i);
            var weekEnd = weekStart.AddDays(7);
            
            last8WeeksTrend.Add(new WeeklyAggregateDto
            {
                WeekLabel = weekStart.ToString("MM-dd"),
                CreatedTasks = tasks.Count(t => t.CreatedDate >= weekStart && t.CreatedDate < weekEnd),
                CompletedTasks = completedTasks.Count(t => t.CompletedDate >= weekStart && t.CompletedDate < weekEnd)
            });
        }

        return new AiInsightDataDto
        {
            OverallAverageCompletionDays = overallAverage,
            OverallMedianCompletionDays = overallMedian,
            FastestCategory = fastestCat,
            SlowestCategory = slowestCat,
            CategoryPerformances = categoryPerformances,
            PriorityPerformances = priorityPerformances,
            OnTimeCompletionRate = onTimeRate,
            OverdueCompletedTasks = overdueCompleted,
            ActiveOverdueTasks = activeOverdue,
            CurrentWeekCompleted = currentWeekCompleted,
            PreviousWeekSamePeriodCompleted = previousWeekSamePeriodCompleted,
            WeekOverWeekChangeRatio = wowChange,
            Last8WeeksTrend = last8WeeksTrend
        };
    }
}
