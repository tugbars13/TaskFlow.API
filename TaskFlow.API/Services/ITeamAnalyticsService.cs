using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Services;

public interface ITeamAnalyticsService
{
    Task<TeamAnalyticsDto> GetTeamAnalyticsAsync(int teamId, string period, int currentUserId);
}
