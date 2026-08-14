using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IAiService
{
    Task<string> GenerateInsightAsync(AiInsightDataDto data);
}
