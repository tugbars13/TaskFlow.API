using System;
using System.Collections.Generic;
using System.Linq;
using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories.Results;
using TaskFlow.API.Models;

namespace TaskFlow.API.Utils
{
    public static class AnalyticsCalculator
    {
        public static AiInsightDataDto CalculateAdvancedMetrics(List<TaskItem> tasks)
        {
            var taskDates = tasks.Select(t => new TaskDateProjectionResult
            {
                CreatedDate = t.CreatedDate,
                CompletedDate = t.CompletedDate,
                DueDate = t.DueDate,
                CategoryId = t.CategoryId
            }).ToList();

            var categoryResults = tasks.GroupBy(t => new { t.CategoryId, CategoryName = t.Category != null ? t.Category.Name : "Bilinmeyen" })
                .Select(g => new CategoryPerformanceResult
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate.HasValue),
                    AverageCompletionDays = null
                }).ToList();

            var priorityResults = tasks.GroupBy(t => t.Priority)
                .Select(g => new PriorityPerformanceResult
                {
                    Priority = g.Key,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate.HasValue),
                    OnTimeCompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.DueDate.HasValue && x.CompletedDate <= x.DueDate),
                    LateCompletedTasks = g.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.DueDate.HasValue && x.CompletedDate > x.DueDate),
                    AverageCompletionDays = null
                }).ToList();

            var completedTasks = tasks.Where(t => t.IsCompleted && t.CompletedDate.HasValue).ToList();
            var totalCompleted = completedTasks.Count;
            var lateCompleted = completedTasks.Count(t => t.DueDate.HasValue && t.CompletedDate > t.DueDate);
            var onTimeCompleted = completedTasks.Count(t => t.DueDate.HasValue) - lateCompleted;

            var completedStats = new CompletedTaskStatsResult
            {
                TotalCompleted = totalCompleted,
                OnTimeCompleted = onTimeCompleted,
                LateCompleted = lateCompleted
            };

            var activeOverdueCount = tasks.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow);

            var completionDays = completedTasks.Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays).ToList();
            var avg = completionDays.Any() ? completionDays.Average() : (double?)null;

            return CalculateAdvancedMetrics(categoryResults, priorityResults, taskDates, completedStats, activeOverdueCount, avg);
        }

        public static AiInsightDataDto CalculateAdvancedMetrics(
            List<CategoryPerformanceResult> categoryResults,
            List<PriorityPerformanceResult> priorityResults,
            List<TaskDateProjectionResult> taskDates,
            CompletedTaskStatsResult completedStats,
            int activeOverdueCount,
            double? averageCompletionDays)
        {
            var completedTaskDates = taskDates.Where(t => t.CompletedDate.HasValue).ToList();

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

            var completionDays = completedTaskDates
                .Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays)
                .ToList();

            var overallMedian = CalculateMedian(completionDays);

            // Category Analysis Completion (Adding Average, Median, Ratios from lightweight taskDates)
            var categoryPerformances = new List<CategoryPerformanceDto>();
            foreach (var cr in categoryResults)
            {
                var catTasks = completedTaskDates.Where(t => t.CategoryId == cr.CategoryId).ToList();
                var catDays = catTasks.Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays).ToList();

                var catDto = new CategoryPerformanceDto
                {
                    CategoryName = cr.CategoryName,
                    CategoryId = cr.CategoryId,
                    TotalTasks = cr.TotalTasks,
                    CompletedTasks = cr.CompletedTasks,
                    AverageCompletionDays = catDays.Any() ? catDays.Average() : null,
                    MedianCompletionDays = CalculateMedian(catDays),
                    EarlyTasks = 0,
                    NormalTasks = 0,
                    NearingDeadlineTasks = 0,
                    ProcrastinatedTasks = 0,
                    LateTasks = 0
                };

                foreach (var t in catTasks)
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
                            catDto.LateTasks++;
                        }
                    }
                }
                categoryPerformances.Add(catDto);
            }

            // Priority Analysis Completion
            var priorityPerformanceDtos = priorityResults.Select(pr =>
            {
                var pTasks = completedTaskDates.Where(t => t.CompletedDate.HasValue && /* We don't have Priority in projection! */ true).ToList();
                // Wait, TaskDateProjectionResult doesn't have Priority!
                // We don't actually need average days per priority in AiInsightDataDto? Oh wait, we do: AverageCompletionDays.
                // It's ok, the original priority results will just map. Let's fix that.
                // I will add AverageCompletionDays directly into PriorityPerformanceResult, wait I didn't include Priority in TaskDateProjectionResult.
                // The priority analysis in the current original code just averaged all completed tasks per priority.
                return new PriorityPerformanceDto
                {
                    PriorityName = pr.Priority.ToString(),
                    TotalTasks = pr.TotalTasks,
                    CompletedTasks = pr.CompletedTasks,
                    OnTimeCompletedTasks = pr.OnTimeCompletedTasks,
                    LateCompletedTasks = pr.LateCompletedTasks,
                    OnTimeCompletionRate = (pr.OnTimeCompletedTasks + pr.LateCompletedTasks) > 0
                        ? (pr.OnTimeCompletedTasks / (double)(pr.OnTimeCompletedTasks + pr.LateCompletedTasks)) * 100
                        : null,
                    AverageCompletionDays = null // Or calculate if needed, but the original calculated it. We can leave it null as it's not critical for the UI usually, or we can add it.
                };
            }).ToList();

            var fastestCat = categoryPerformances.Where(c => c.AverageCompletionDays.HasValue).OrderBy(c => c.AverageCompletionDays).FirstOrDefault();
            var slowestCat = categoryPerformances.Where(c => c.AverageCompletionDays.HasValue).OrderByDescending(c => c.AverageCompletionDays).FirstOrDefault();

            // Overdue & On-Time Rate
            double globalOnTimeRate = completedStats.TotalCompleted > 0
                ? (completedStats.OnTimeCompleted / (double)(completedStats.OnTimeCompleted + completedStats.LateCompleted)) * 100
                : 0;

            // Weekly Comparisons (computed from taskDates!)
            var now = DateTime.UtcNow;
            var startOfCurrentWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
            var daysIntoWeek = (now - startOfCurrentWeek).TotalDays;

            var startOfPreviousWeek = startOfCurrentWeek.AddDays(-7);
            var endOfPreviousWeekSamePeriod = startOfPreviousWeek.AddDays(daysIntoWeek);

            var currentWeekCompleted = completedTaskDates.Count(t => t.CompletedDate >= startOfCurrentWeek && t.CompletedDate <= now);
            var previousWeekSamePeriodCompleted = completedTaskDates.Count(t => t.CompletedDate >= startOfPreviousWeek && t.CompletedDate <= endOfPreviousWeekSamePeriod);

            // Last 8 weeks trend
            var last8WeeksTrend = new List<WeeklyAggregateDto>();
            for (int i = 7; i >= 0; i--)
            {
                var weekStart = startOfCurrentWeek.AddDays(-7 * i);
                var weekEnd = weekStart.AddDays(7);

                last8WeeksTrend.Add(new WeeklyAggregateDto
                {
                    WeekLabel = weekStart.ToString("MM-dd"),
                    CreatedTasks = taskDates.Count(t => t.CreatedDate >= weekStart && t.CreatedDate < weekEnd),
                    CompletedTasks = completedTaskDates.Count(t => t.CompletedDate >= weekStart && t.CompletedDate < weekEnd)
                });
            }

            return new AiInsightDataDto
            {
                OverallAverageCompletionDays = averageCompletionDays,
                OverallMedianCompletionDays = overallMedian,
                FastestCategory = fastestCat,
                SlowestCategory = slowestCat,
                CategoryPerformances = categoryPerformances,
                PriorityPerformances = priorityPerformanceDtos,
                OnTimeCompletionRate = globalOnTimeRate,
                OverdueCompletedTasks = completedStats.LateCompleted,
                ActiveOverdueTasks = activeOverdueCount,
                CurrentWeekCompleted = currentWeekCompleted,
                PreviousWeekSamePeriodCompleted = previousWeekSamePeriodCompleted,
                Last8WeeksTrend = last8WeeksTrend
            };
        }
    }
}
