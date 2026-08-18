using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskFlow.API.DTOs.Team;
using TaskFlow.API.Repositories;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public class TeamAnalyticsService : ITeamAnalyticsService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IAiService _aiService;

    public TeamAnalyticsService(ITaskRepository taskRepository, ITeamRepository teamRepository, IAiService aiService)
    {
        _taskRepository = taskRepository;
        _teamRepository = teamRepository;
        _aiService = aiService;
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

    public async Task<TeamAnalyticsDto> GetTeamAnalyticsAsync(int teamId, string period, int currentUserId)
    {
        var team = await _teamRepository.GetTeamAsync(teamId);
        if (team == null) throw new Exception("Team not found");

        var members = await _teamRepository.GetMembersByTeamIdAsync(teamId);
        var tasks = await _taskRepository.GetByTeamIdAsync(teamId);
        tasks = tasks.Where(t => !t.IsDeleted).ToList();

        var now = DateTime.UtcNow;
        DateTime startDate;
        DateTime endDate;
        DateTime prevStartDate;
        DateTime prevEndDate;

        switch (period.ToLower())
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

        var currentActive = tasks.Where(t => IsTaskActiveInPeriod(t, startDate, endDate)).ToList();
        var prevActive = tasks.Where(t => IsTaskActiveInPeriod(t, prevStartDate, prevEndDate)).ToList();

        int completedTasks = currentActive.Count(t => IsTaskCompletedInPeriod(t, startDate, endDate));
        int inProgressTasks = currentActive.Count(t => !t.IsCompleted || (t.IsCompleted && t.CompletedDate > endDate));
        var overdueTasks = currentActive.Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value < now).ToList();

        int completionRate = currentActive.Count > 0 ? (int)Math.Round((double)completedTasks / currentActive.Count * 100) : 0;

        int prevCompletedTasks = prevActive.Count(t => IsTaskCompletedInPeriod(t, prevStartDate, prevEndDate));
        int prevCompletionRate = prevActive.Count > 0 ? (int)Math.Round((double)prevCompletedTasks / prevActive.Count * 100) : 0;

        // Trend calculation
        var trend = new List<ProgressTrendDto>();
        if (period.ToLower() == "daily")
        {
            // 4 intervals of 6 hours for today
            for (int i = 0; i < 4; i++)
            {
                var intervalStart = startDate.AddHours(i * 6);
                var intervalEnd = intervalStart.AddHours(6).AddTicks(-1);
                var intervalActive = currentActive.Where(t => IsTaskActiveInPeriod(t, intervalStart, intervalEnd)).ToList();
                var intervalCompleted = intervalActive.Count(t => IsTaskCompletedInPeriod(t, intervalStart, intervalEnd));
                var rate = intervalActive.Count > 0 ? (int)Math.Round((double)intervalCompleted / intervalActive.Count * 100) : 0;
                
                trend.Add(new ProgressTrendDto {
                    Label = $"{i*6:D2}:00",
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
                var intervalActive = currentActive.Where(t => IsTaskActiveInPeriod(t, iStart, iEnd)).ToList();
                var intervalCompleted = intervalActive.Count(t => IsTaskCompletedInPeriod(t, iStart, iEnd));
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
                var dayActive = currentActive.Where(t => IsTaskActiveInPeriod(t, dayStart, dayEnd)).ToList();
                var dayCompleted = dayActive.Count(t => IsTaskCompletedInPeriod(t, dayStart, dayEnd));
                var rate = dayActive.Count > 0 ? (int)Math.Round((double)dayCompleted / dayActive.Count * 100) : 0;
                
                var label = i switch { 0 => "Pzt", 1 => "Sal", 2 => "Çar", 3 => "Per", 4 => "Cum", 5 => "Cmt", 6 => "Paz", _ => "" };
                trend.Add(new ProgressTrendDto { Label = label, CompletionRate = rate });
            }
        }

        // Active members
        var activeMembers = members.Select(m => {
            var mTasks = currentActive.Where(t => t.AssignedUserId == m.UserId || t.Assignees.Any(a => a.UserId == m.UserId)).ToList();
            return new ActiveMemberDto
            {
                UserId = m.UserId,
                FullName = m.User?.FullName ?? "Bilinmiyor",
                TotalTasks = mTasks.Count,
                CompletedTasks = mTasks.Count(t => IsTaskCompletedInPeriod(t, startDate, endDate)),
                InProgressTasks = mTasks.Count(t => !t.IsCompleted || (t.IsCompleted && t.CompletedDate > endDate))
            };
        })
        .Where(m => m.TotalTasks > 0)
        .OrderByDescending(m => m.TotalTasks)
        .Take(5)
        .ToList();

        var overdueTasksList = overdueTasks
            .OrderByDescending(t => (now - t.DueDate.Value).TotalDays)
            .Take(5)
            .Select(t => new OverdueTaskDto
            {
                TaskId = t.Id,
                Title = t.Title,
                OverdueDays = (int)(now - t.DueDate.Value).TotalDays,
                AssigneeName = t.AssignedUser?.FullName ?? "Atanmamış"
            }).ToList();

        var dto = new TeamAnalyticsDto
        {
            TeamId = team.Id,
            TeamName = team.Name,
            MemberCount = members.Count,
            CompletedTasks = completedTasks,
            InProgressTasks = inProgressTasks,
            OverdueTasks = overdueTasks.Count,
            CompletionRate = completionRate,
            PreviousPeriodCompletionRate = prevCompletionRate,
            ProgressTrend = trend,
            PeriodDateRange = $"{startDate:dd MMM yyyy} - {endDate:dd MMM yyyy}",
            ActiveMembers = activeMembers,
            OverdueTasksList = overdueTasksList
        };

        try {
            dto.AiSummary = await _aiService.GenerateTeamInsightAsync(dto);
        } catch (Exception) {
            dto.AiSummary = "Takım verileri hesaplandı. Lütfen geciken görevlere öncelik verin.";
        }

        return dto;
    }
}

