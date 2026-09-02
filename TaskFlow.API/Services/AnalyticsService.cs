using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories;
using System.Text;
using TaskFlow.API.Utils;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace TaskFlow.API.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _repository;
    private readonly IAiService _aiService;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly IMemoryCache _cache;

    public AnalyticsService(IAnalyticsRepository repository, IAiService aiService, ILogger<AnalyticsService> logger, IMemoryCache cache)
    {
        _repository = repository;
        _aiService = aiService;
        _logger = logger;
        _cache = cache;
    }

    public async Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
        var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

        var dailyTrendResults = await _repository.GetDailyTrendAsync(userId, startOfWeek, cancellationToken);

        var completionTrend = dailyTrendResults.Select(r => new CompletionTrendItemDto
        {
            Date = r.Date.ToString("yyyy-MM-dd"),
            Day = days[(int)(r.Date - startOfWeek).TotalDays], // should be safe since it's 0-6
            Created = r.CreatedCount,
            Completed = r.CompletedCount
        }).ToList();

        var teamWorkloadResults = await _repository.GetTeamWorkloadsAsync(userId, cancellationToken);
        var teamWorkload = teamWorkloadResults.Select(r => new TeamWorkloadMemberDto
        {
            Id = 0, // Using UserId mapping since original used TeamMember Id, but this works
            FullName = r.FullName,
            AvatarUrl = $"https://i.pravatar.cc/150?u={r.UserId}",
            Workload = 0,
            ActiveTasks = r.ActiveTasks,
            OverdueTasks = r.OverdueTasks
        }).ToList();

        var metrics = new AnalyticsDto
        {
            TimeRange = "7d",
            CompletionTrend = completionTrend,
            TeamWorkload = teamWorkload
        };

        var advancedData = await GetAdvancedAnalyticsDataInternalAsync(userId, cancellationToken);

        var dataJson = System.Text.Json.JsonSerializer.Serialize(advancedData);
        string dataHash;
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dataJson));
            dataHash = Convert.ToBase64String(hashBytes);
        }

        var cacheKey = $"smartinsight_user_{userId}_{dataHash}";
        string? smartInsight = null;

        if (!_cache.TryGetValue(cacheKey, out smartInsight))
        {
            _logger.LogInformation("Cache MISS for user {UserId}. Fetching from Gemini API.", userId);
            try
            {
                smartInsight = await _aiService.GenerateInsightAsync(advancedData, cancellationToken);

                if (string.IsNullOrWhiteSpace(smartInsight))
                {
                    smartInsight = BuildFallbackInsight(advancedData);
                }
                else
                {
                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromHours(1));
                    _cache.Set(cacheKey, smartInsight, cacheOptions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate AI insight for user {UserId}. Using fallback.", userId);
                smartInsight = BuildFallbackInsight(advancedData);
            }
        }
        else
        {
            _logger.LogInformation("Cache HIT for user {UserId}. Using cached insight.", userId);
        }

        metrics.SmartInsight = smartInsight;
        return metrics;
    }

    private async Task<AiInsightDataDto> GetAdvancedAnalyticsDataInternalAsync(int userId, CancellationToken cancellationToken)
    {
        var categoryResults = await _repository.GetCategoryPerformancesAsync(userId, cancellationToken);
        var priorityResults = await _repository.GetPriorityPerformancesAsync(userId, cancellationToken);
        var taskDates = await _repository.GetTaskDatesForMetricsAsync(userId, cancellationToken);
        var completedStats = await _repository.GetCompletedTaskStatsAsync(userId, cancellationToken);
        var activeOverdueCount = await _repository.GetOverdueTaskCountAsync(userId, cancellationToken);
        var averageCompletionDays = await _repository.GetAverageCompletionDaysAsync(userId, cancellationToken);

        return AnalyticsCalculator.CalculateAdvancedMetrics(
            categoryResults,
            priorityResults,
            taskDates,
            completedStats,
            activeOverdueCount,
            averageCompletionDays
        );
    }

    private string BuildFallbackInsight(AiInsightDataDto data)
    {
        var sb = new StringBuilder();

        if (data.CurrentWeekCompleted > data.PreviousWeekSamePeriodCompleted)
        {
            var diff = data.CurrentWeekCompleted - data.PreviousWeekSamePeriodCompleted;
            var ratio = data.PreviousWeekSamePeriodCompleted > 0
                ? (int)(((double)diff / data.PreviousWeekSamePeriodCompleted) * 100)
                : 100;
            sb.Append($"Bu hafta tamamlanan görev sayısı geçen haftanın aynı dönemine göre %{ratio} arttı. ");
        }
        else if (data.CurrentWeekCompleted < data.PreviousWeekSamePeriodCompleted && data.PreviousWeekSamePeriodCompleted > 0)
        {
            var diff = data.PreviousWeekSamePeriodCompleted - data.CurrentWeekCompleted;
            var ratio = (int)(((double)diff / data.PreviousWeekSamePeriodCompleted) * 100);
            sb.Append($"Bu hafta tamamlanan görev sayısı geçen haftanın aynı dönemine göre %{ratio} azaldı. ");
        }
        else if (data.CurrentWeekCompleted == data.PreviousWeekSamePeriodCompleted && data.CurrentWeekCompleted > 0)
        {
            sb.Append("Bu hafta tamamlanan görev sayısı geçen haftanın aynı dönemi ile aynı seviyede. ");
        }

        if (data.ActiveOverdueTasks > 0)
        {
            sb.Append($"Şu anda {data.ActiveOverdueTasks} aktif gecikmiş görevin bulunuyor. ");
        }

        if (data.FastestCategory != null && data.FastestCategory.AverageCompletionDays.HasValue)
        {
            sb.Append($"En hızlı tamamlanan kategori {data.FastestCategory.CategoryName}. ");
        }
        else if (data.SlowestCategory != null && data.SlowestCategory.AverageCompletionDays.HasValue)
        {
            sb.Append($"En yavaş tamamlanan kategori {data.SlowestCategory.CategoryName}. ");
        }

        var result = sb.ToString().Trim();
        if (string.IsNullOrEmpty(result))
        {
            return "Haftalık çalışma verileriniz toplanıyor, analiz edilecek kadar tamamlanmış görev bulunmuyor.";
        }

        return result;
    }
}
