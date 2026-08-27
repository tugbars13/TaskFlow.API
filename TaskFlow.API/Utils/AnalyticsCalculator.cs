using System;
using System.Collections.Generic;
using System.Linq;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Utils
{
    public static class AnalyticsCalculator
    {
        public static AiInsightDataDto CalculateAdvancedMetrics(List<TaskItem> tasks)
        {
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
            var groupedByCategory = tasks.GroupBy(t => new { t.CategoryId, Name = t.Category != null ? t.Category.Name : "Bilinmeyen" });

            foreach (var group in groupedByCategory)
            {
                var catCompleted = group.Where(t => t.IsCompleted && t.CompletedDate.HasValue).ToList();
                var catDays = catCompleted.Where(t => t.CompletedDate.HasValue).Select(t => (t.CompletedDate!.Value - t.CreatedDate).TotalDays).ToList();
                
                var catDto = new CategoryPerformanceDto
                {
                    CategoryName = group.Key.Name,
                    CategoryId = group.Key.CategoryId,
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
            var globalOnTimeRate = totalWithDueDateCompleted > 0 ? ((totalWithDueDateCompleted - overdueCompleted) / (double)totalWithDueDateCompleted) * 100 : 0;

            // Weekly Comparisons
            var now = DateTime.UtcNow;
            var startOfCurrentWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
            var daysIntoWeek = (now - startOfCurrentWeek).TotalDays;
            
            var startOfPreviousWeek = startOfCurrentWeek.AddDays(-7);
            var endOfPreviousWeekSamePeriod = startOfPreviousWeek.AddDays(daysIntoWeek);

            var currentWeekCompleted = completedTasks.Count(t => t.CompletedDate >= startOfCurrentWeek && t.CompletedDate <= now);
            var previousWeekSamePeriodCompleted = completedTasks.Count(t => t.CompletedDate >= startOfPreviousWeek && t.CompletedDate <= endOfPreviousWeekSamePeriod);

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
                OnTimeCompletionRate = globalOnTimeRate,
                OverdueCompletedTasks = overdueCompleted,
                ActiveOverdueTasks = activeOverdue,
                CurrentWeekCompleted = currentWeekCompleted,
                PreviousWeekSamePeriodCompleted = previousWeekSamePeriodCompleted,
                Last8WeeksTrend = last8WeeksTrend
            };
        }
    }
}
