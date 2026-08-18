using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface IAiService
{
    Task<string> GenerateInsightAsync(AiInsightDataDto data);
    Task<TaskBreakdownResultDto> GenerateTaskBreakdownAsync(TaskItem task);
    Task<List<AiTaskOrderDto>> GenerateTaskOrderAsync(IEnumerable<TaskItem> tasks, AiInsightDataDto metrics);
    Task<string> GenerateTeamInsightAsync(TaskFlow.API.DTOs.Team.TeamAnalyticsDto data);
}