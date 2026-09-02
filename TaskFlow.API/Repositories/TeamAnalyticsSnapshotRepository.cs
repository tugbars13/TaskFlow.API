using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public class TeamAnalyticsSnapshotRepository : ITeamAnalyticsSnapshotRepository
    {
        private readonly AppDbContext _context;

        public TeamAnalyticsSnapshotRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TeamAnalyticsSnapshot?> GetLatestSnapshotAsync(int teamId, CancellationToken cancellationToken = default)
        {
            return await _context.TeamAnalyticsSnapshots
                .AsNoTracking()
                .Where(s => s.TeamId == teamId)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<TeamAnalyticsSnapshot?> GetSnapshotAsync(int teamId, string periodType, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            return await _context.TeamAnalyticsSnapshots
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.TeamId == teamId && s.PeriodType == periodType && s.StartDate == startDate && s.EndDate == endDate, cancellationToken);
        }

        public async Task AddSnapshotAsync(TeamAnalyticsSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            await _context.TeamAnalyticsSnapshots.AddAsync(snapshot, cancellationToken);
        }

        public async Task<int> DeleteOldSnapshotsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
        {
            return await _context.TeamAnalyticsSnapshots
                .Where(s => s.CreatedAt < beforeDate)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}
