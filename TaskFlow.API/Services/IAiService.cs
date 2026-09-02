using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface IAiService
{
    Task<string> GenerateInsightAsync(AiInsightDataDto data, CancellationToken cancellationToken = default);
    Task<TaskBreakdownResultDto> GenerateTaskBreakdownAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<List<AiTaskOrderDto>> GenerateTaskOrderAsync(IEnumerable<TaskItem> tasks, UserBehaviorProfile profile, CancellationToken cancellationToken = default);
    Task<string> GenerateTeamInsightAsync(TaskFlow.API.DTOs.Team.TeamAnalyticsDto data, CancellationToken cancellationToken = default);
}
