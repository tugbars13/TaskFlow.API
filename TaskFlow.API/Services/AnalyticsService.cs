using TaskFlow.API.DTOs;
using TaskFlow.API.Repositories;
using System.Text;

namespace TaskFlow.API.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _repository;
    private readonly IAiService _aiService;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(IAnalyticsRepository repository, IAiService aiService, ILogger<AnalyticsService> logger)
    {
        _repository = repository;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<AnalyticsDto> GetAnalyticsMetricsAsync(int userId)
    {
        var metrics = await _repository.GetAnalyticsMetricsAsync(userId);
        var advancedData = await _repository.GetAdvancedAnalyticsDataAsync(userId);

        string? smartInsight = null;

        try
        {
            smartInsight = await _aiService.GenerateInsightAsync(advancedData);

            if (string.IsNullOrWhiteSpace(smartInsight))
            {
                smartInsight = BuildFallbackInsight(advancedData);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI insight for user {UserId}. Using fallback.", userId);
            smartInsight = BuildFallbackInsight(advancedData);
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
