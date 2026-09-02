using System;
using System.Threading;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.Repositories;
using TaskFlow.API.Models;
using TaskFlow.API.Data;
using System.Text.Json;

namespace TaskFlow.API.Services;

public class TeamAnalyticsService : ITeamAnalyticsService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IAiService _aiService;
    private readonly ITeamAnalyticsSnapshotRepository _snapshotRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TeamAnalyticsService(
        ITaskRepository taskRepository,
        ITeamRepository teamRepository,
        IAiService aiService,
        ITeamAnalyticsSnapshotRepository snapshotRepository,
        IUnitOfWork unitOfWork)
    {
        _taskRepository = taskRepository;
        _teamRepository = teamRepository;
        _aiService = aiService;
        _snapshotRepository = snapshotRepository;
        _unitOfWork = unitOfWork;
    }

    private bool IsTaskActiveInPeriod(TaskItem t, DateTime start, DateTime end)
    {
        if (t.CreatedDate > end) return false;
        if (t.IsCompleted && t.CompletedDate.HasValue && t.CompletedDate.Value < start) return false;
        return true;
    }

    private bool IsTaskCompletedInPeriod(TaskItem t, DateTime start, DateTime end)
    {
        return t.IsCompleted && t.CompletedDate.HasValue && t.CompletedDate.Value >= start && t.CompletedDate.Value <= end;
    }

    public async Task<TeamAnalyticsDto> GetTeamAnalyticsAsync(int teamId, string period, int currentUserId, DateTime? targetDate = null, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetTeamAsync(teamId, cancellationToken);
        if (team == null) throw new Exception("Team not found");

        var now = targetDate ?? DateTime.UtcNow;
        DateTime startDate;
        DateTime endDate;
        DateTime prevStartDate;
        DateTime prevEndDate;
        string pType = period.ToLower() == "monthly" ? "monthly" : (period.ToLower() == "daily" ? "daily" : "weekly");

        switch (pType)
        {
            case "daily":
                startDate = now.Date;
                endDate = startDate.AddDays(1).AddTicks(-1);
                prevStartDate = startDate.AddDays(-1);
                prevEndDate = endDate.AddDays(-1);
                break;
            case "monthly":
                startDate = new DateTime(now.Year, now.Month, 1);
                endDate = startDate.AddMonths(1).AddTicks(-1);
                prevStartDate = startDate.AddMonths(-1);
                prevEndDate = startDate.AddTicks(-1);
                break;
            case "weekly":
            default:
                int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
                startDate = now.AddDays(-1 * diff).Date;
                endDate = startDate.AddDays(7).AddTicks(-1);
                prevStartDate = startDate.AddDays(-7);
                prevEndDate = startDate.AddTicks(-1);
                break;
        }

        // --- SNAPSHOT CHECK ---
        var existingSnapshot = await _snapshotRepository.GetSnapshotAsync(teamId, pType, startDate, endDate, cancellationToken);

        if (existingSnapshot != null)
        {
            return new TeamAnalyticsDto
            {
                TeamId = existingSnapshot.TeamId,
                TeamName = team.Name,
                MemberCount = existingSnapshot.MemberCount,
                CompletedTasks = existingSnapshot.CompletedTasks,
                InProgressTasks = existingSnapshot.InProgressTasks,
                OverdueTasks = existingSnapshot.OverdueTasks,
                CompletionRate = existingSnapshot.CompletionRate,
                PreviousPeriodCompletionRate = existingSnapshot.PreviousPeriodCompletionRate,
                ProgressTrend = string.IsNullOrEmpty(existingSnapshot.ProgressTrendJson) ? new List<ProgressTrendDto>() : JsonSerializer.Deserialize<List<ProgressTrendDto>>(existingSnapshot.ProgressTrendJson) ?? new List<ProgressTrendDto>(),
                ActiveMembers = string.IsNullOrEmpty(existingSnapshot.ActiveMembersJson) ? new List<ActiveMemberDto>() : JsonSerializer.Deserialize<List<ActiveMemberDto>>(existingSnapshot.ActiveMembersJson) ?? new List<ActiveMemberDto>(),
                OverdueTasksList = string.IsNullOrEmpty(existingSnapshot.OverdueTasksListJson) ? new List<OverdueTaskDto>() : JsonSerializer.Deserialize<List<OverdueTaskDto>>(existingSnapshot.OverdueTasksListJson) ?? new List<OverdueTaskDto>(),
                AiSummary = existingSnapshot.AiSummary,
                PeriodDateRange = $"{startDate:dd MMM yyyy} - {endDate:dd MMM yyyy}"
            };
        }

        var members = await _teamRepository.GetMembersByTeamIdAsync(teamId, 1, int.MaxValue, cancellationToken);

        var metrics = await _taskRepository.GetTeamAnalyticsMetricsAsync(teamId, startDate, endDate, prevStartDate, prevEndDate, now, cancellationToken);
        var activeMembersResult = await _taskRepository.GetTeamActiveMembersAnalyticsAsync(teamId, startDate, endDate, 5, cancellationToken);
        var overdueTasksListResult = await _taskRepository.GetTeamOverdueTasksAsync(teamId, now, 5, cancellationToken);

        var activeMembers = activeMembersResult.Select(m => new ActiveMemberDto
        {
            UserId = m.UserId,
            FullName = m.FullName,
            TotalTasks = m.TotalTasks,
            CompletedTasks = m.CompletedTasks,
            InProgressTasks = m.InProgressTasks
        }).ToList();

        var overdueTasksList = overdueTasksListResult.Select(t => new OverdueTaskDto
        {
            TaskId = t.TaskId,
            Title = t.Title,
            OverdueDays = t.DueDate.HasValue ? (int)(now - t.DueDate.Value).TotalDays : 0,
            AssigneeName = t.Assignees.Any() ? string.Join(", ", t.Assignees) : "Atanmamış"
        }).ToList();

        var currentActive = await _taskRepository.GetActiveTasksForAnalyticsAsync(teamId, startDate, endDate, cancellationToken);

        int completionRate = metrics.CurrentTotal > 0 ? (int)Math.Round((double)metrics.CompletedTasks / metrics.CurrentTotal * 100) : 0;
        int prevCompletionRate = metrics.PrevTotal > 0 ? (int)Math.Round((double)metrics.PrevCompletedTasks / metrics.PrevTotal * 100) : 0;

        // Trend calculation
        var trend = new List<ProgressTrendDto>();
        if (period.ToLower() == "daily")
        {
            var intervals = new[] {
                (0, 8, "08:00"),
                (8, 10, "10:00"),
                (10, 13, "13:00"),
                (13, 15, "15:00"),
                (15, 17, "17:00")
            };

            foreach (var (startHour, endHour, label) in intervals)
            {
                var intervalStart = startDate.AddHours(startHour);
                var intervalEnd = startDate.AddHours(endHour).AddTicks(-1);
                var intervalActive = currentActive.Where(t => t.CreatedDate <= intervalEnd && (!t.IsCompleted || t.CompletedDate >= intervalStart)).ToList();
                var intervalCompleted = intervalActive.Count(t => t.IsCompleted && t.CompletedDate >= intervalStart && t.CompletedDate <= intervalEnd);
                var rate = intervalActive.Count > 0 ? (int)Math.Round((double)intervalCompleted / intervalActive.Count * 100) : 0;

                trend.Add(new ProgressTrendDto
                {
                    Label = label,
                    CompletionRate = rate
                });
            }
        }
        else if (period.ToLower() == "monthly")
        {
            // Weekly intervals within the month
            var w1End = startDate.AddDays(7).AddTicks(-1);
            var w2End = startDate.AddDays(14).AddTicks(-1);
            var w3End = startDate.AddDays(21).AddTicks(-1);

            var intervals = new[] {
                (startDate, w1End, "Hafta 1"),
                (w1End.AddTicks(1), w2End, "Hafta 2"),
                (w2End.AddTicks(1), w3End, "Hafta 3"),
                (w3End.AddTicks(1), endDate, "Hafta 4")
            };

            foreach (var (iStart, iEnd, label) in intervals)
            {
                var intervalActive = currentActive.Where(t => t.CreatedDate <= iEnd && (!t.IsCompleted || t.CompletedDate >= iStart)).ToList();
                var intervalCompleted = intervalActive.Count(t => t.IsCompleted && t.CompletedDate >= iStart && t.CompletedDate <= iEnd);
                var rate = intervalActive.Count > 0 ? (int)Math.Round((double)intervalCompleted / intervalActive.Count * 100) : 0;
                trend.Add(new ProgressTrendDto { Label = label, CompletionRate = rate });
            }
        }
        else // weekly
        {
            for (int i = 0; i < 7; i++)
            {
                var dayStart = startDate.AddDays(i);
                var dayEnd = dayStart.AddDays(1).AddTicks(-1);
                var dayActive = currentActive.Where(t => t.CreatedDate <= dayEnd && (!t.IsCompleted || t.CompletedDate >= dayStart)).ToList();
                var dayCompleted = dayActive.Count(t => t.IsCompleted && t.CompletedDate >= dayStart && t.CompletedDate <= dayEnd);
                var rate = dayActive.Count > 0 ? (int)Math.Round((double)dayCompleted / dayActive.Count * 100) : 0;

                var label = i switch { 0 => "Pzt", 1 => "Sal", 2 => "Çar", 3 => "Per", 4 => "Cum", 5 => "Cmt", 6 => "Paz", _ => "" };
                trend.Add(new ProgressTrendDto { Label = label, CompletionRate = rate });
            }
        }



        var dto = new TeamAnalyticsDto
        {
            TeamId = team.Id,
            TeamName = team.Name,
            MemberCount = members.Count,
            CompletedTasks = metrics.CompletedTasks,
            InProgressTasks = metrics.InProgressTasks,
            OverdueTasks = metrics.OverdueTasks,
            CompletionRate = completionRate,
            PreviousPeriodCompletionRate = prevCompletionRate,
            ProgressTrend = trend,
            PeriodDateRange = $"{startDate:dd MMM yyyy} - {endDate:dd MMM yyyy}",
            ActiveMembers = activeMembers,
            OverdueTasksList = overdueTasksList
        };

        try
        {
            dto.AiSummary = await _aiService.GenerateTeamInsightAsync(dto, cancellationToken);
        }
        catch (Exception)
        {
            dto.AiSummary = "Takım verileri hesaplandı. Lütfen geciken görevlere öncelik verin.";
        }

        var newSnapshot = new TeamAnalyticsSnapshot
        {
            TeamId = dto.TeamId,
            PeriodType = pType,
            StartDate = startDate,
            EndDate = endDate,
            MemberCount = dto.MemberCount,
            CompletedTasks = dto.CompletedTasks,
            InProgressTasks = dto.InProgressTasks,
            OverdueTasks = dto.OverdueTasks,
            CompletionRate = dto.CompletionRate,
            PreviousPeriodCompletionRate = dto.PreviousPeriodCompletionRate,
            ProgressTrendJson = JsonSerializer.Serialize(dto.ProgressTrend),
            ActiveMembersJson = JsonSerializer.Serialize(dto.ActiveMembers),
            OverdueTasksListJson = JsonSerializer.Serialize(dto.OverdueTasksList),
            AiSummary = dto.AiSummary,
            CreatedAt = DateTime.UtcNow
        };
        await _snapshotRepository.AddSnapshotAsync(newSnapshot, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return dto;
    }
}
