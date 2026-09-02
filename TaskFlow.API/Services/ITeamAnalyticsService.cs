using System.Threading;
using System.Threading.Tasks;
using System;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Services;

public interface ITeamAnalyticsService
{
    Task<TeamAnalyticsDto> GetTeamAnalyticsAsync(int teamId, string period, int currentUserId, DateTime? targetDate = null, CancellationToken cancellationToken = default);
}

