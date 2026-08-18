using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories;
using System.Text;

using Microsoft.Extensions.Caching.Memory;

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

    public async Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId)
    {
        var metrics = await _repository.GetAnalyticsMetricsAsync(userId);
        var advancedData = await _repository.GetAdvancedAnalyticsDataAsync(userId);

        // Verinin tamamen aynı olup olmadığını kontrol etmek için JSON Hash'ini çıkarıyoruz
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
                smartInsight = await _aiService.GenerateInsightAsync(advancedData);

                if (string.IsNullOrWhiteSpace(smartInsight))
                {
                    smartInsight = BuildFallbackInsight(advancedData);
                }
                else
                {
                    // AI'dan başarılı sonuç dönerse cache'le (Örn: 1 saat boyunca)
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
