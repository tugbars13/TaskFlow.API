using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskFlow.API.Configurations;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public class GeminiAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly AiSettings _settings;

    public GeminiAiService(HttpClient httpClient, IOptions<AiSettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        
        // Timeout is set to approximately 5 seconds as requested
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
    }

    public async Task<string> GenerateInsightAsync(AiInsightDataDto data)
    {
        if (string.IsNullOrEmpty(_settings.ApiKey))
        {
            throw new InvalidOperationException("AI API key is missing from configuration.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

        var prompt = BuildPrompt(data);

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            systemInstruction = new
            {
                parts = new[] { new { text = GetSystemInstruction() } }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 200
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, requestBody);
        
        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDocument = JsonDocument.Parse(responseString);
        
        try
        {
            var textResult = jsonDocument.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return textResult?.Trim() ?? string.Empty;
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to parse the AI response.", ex);
        }
    }

    private string GetSystemInstruction()
    {
        return @"Sen TaskFlow uygulamasının yapay zeka analiz asistanısın. Görevin, sana verilen haftalık çalışma metriklerini inceleyip kullanıcıya Türkçe, tamamen doğal ve en fazla 3 cümlelik bir performans analizi sunmaktır.
Kurallar:
- Sadece Türkçe cevap ver.
- En fazla 3 cümle üret.
- Kullanıcının performansını somut veriler üzerinden değerlendir.
- Bu haftayı geçen haftanın AYNI DÖNEMİ ile karşılaştır.
- Hangi kategorilerde hızlı, hangilerinde yavaş olduğunu belirt.
- Sona bırakma (procrastination) eğilimi veya geciken (overdue) görevler varsa uyar.
- Gerekiyorsa kısa, somut ve uygulanabilir bir öneri ver.
- Verilerde olmayan hiçbir şeyi uydurma.
- Kullanıcı hakkında psikolojik veya kişisel çıkarım yapma. ""Çok çalışkansın"", ""tembelsin"", ""harikasın"" gibi subjektif ve duygusal ifadeler kullanma.
- Her cevapta farklı bir doğal cümle yapısı kullan, sürekli aynı kelimelerle cümleye başlama.
- Eğer değişim oranı (WeekOverWeekChangeRatio) çok küçükse bunu abartılı şekilde ""büyük gelişme"" olarak yorumlama.
- Eğer yeterli veri yoksa (örneğin görev sayısı 0 ise) bunu açıkça ve nötr bir şekilde belirt.";
    }

    private string BuildPrompt(AiInsightDataDto data)
    {
        return $@"
Mevcut Metrikler:
- Genel Ortalama Tamamlanma Süresi: {(data.OverallAverageCompletionDays.HasValue ? data.OverallAverageCompletionDays.Value.ToString("F1") + " gün" : "Veri yok")}
- Bu hafta tamamlanan: {data.CurrentWeekCompleted}
- Geçen hafta aynı dönem tamamlanan: {data.PreviousWeekSamePeriodCompleted}
- Haftalık değişim: {(data.WeekOverWeekChangeRatio.HasValue ? data.WeekOverWeekChangeRatio.Value.ToString("F1") + "%" : "Veri yok")}
- En hızlı kategori: {(data.FastestCategory != null ? $"{data.FastestCategory.CategoryName} ({data.FastestCategory.AverageCompletionDays?.ToString("F1")} gün)" : "Veri yok")}
- En yavaş kategori: {(data.SlowestCategory != null ? $"{data.SlowestCategory.CategoryName} ({data.SlowestCategory.AverageCompletionDays?.ToString("F1")} gün)" : "Veri yok")}
- Aktif gecikmiş görev sayısı: {data.ActiveOverdueTasks}
- Zamanında tamamlanma oranı: %{data.OnTimeCompletionRate:F1}

Lütfen bu verilere dayanarak kullanıcıya kısa bir durum özeti ve öneri sun.";
    }
}
