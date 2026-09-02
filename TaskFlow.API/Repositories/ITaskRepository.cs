using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories.Results;
namespace TaskFlow.API.Repositories;

public class TaskQueryParameters
{
    public int? Priority { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsCompleted { get; set; }
    public int? Status { get; set; }
    public string? Keyword { get; set; }
    public int? AssigneeId { get; set; }
    public bool AssigneeIsMe { get; set; }
    public bool AssigneeUnassigned { get; set; }
    public DateTime? DueBefore { get; set; }
    public DateTime? DueAfter { get; set; }
    public bool NoDueDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public interface ITaskRepository
{
    Task<List<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskQueryParameters? parameters = null, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskQueryParameters? parameters = null, int? currentUserId = null, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> UpdateTaskAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> DeleteTaskAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task DeleteTaskAssigneesByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task DeleteTasksByTeamIdAsync(int teamId, CancellationToken cancellationToken = default);
    Task<int> GetSubtaskCountAsync(int parentTaskId, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> FilterAsync(int userId, int? priority, int? categoryId, bool? isCompleted, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> SearchAsync(int userId, string keyword, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetPagedAsync(int userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> SortAsync(int userId, string? sortBy, bool isDescending, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetTasksForUserBehaviorProfileAsync(int userId, CancellationToken cancellationToken = default);

    // Yeni Dashboard Metotları (DTO Bağımsız)
    Task<(int Total, int Completed, int Pending, int Overdue, int HighPriority, int Today, int CompletedToday, int WeeklyCompleted, int PrevWeekCompleted)> GetDashboardMetricsAsync(
        int userId, DateTime now, DateTime todayDate, DateTime weekStartDate, DateTime prevWeekStartDate, CancellationToken cancellationToken = default);
    Task<Dictionary<DateTime, int>> GetDailyCompletionTrendAsync(int userId, DateTime startDate, int days, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetTopPriorityTasksAsync(int userId, int limit, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetUpcomingDeadlinesAsync(int userId, DateTime fromDate, int limit, CancellationToken cancellationToken = default);

    Task<(int CompletedTasks, int InProgressTasks, int OverdueTasks, int CurrentTotal, int PrevCompletedTasks, int PrevTotal)> GetTeamAnalyticsMetricsAsync(
        int teamId, DateTime startDate, DateTime endDate, DateTime prevStartDate, DateTime prevEndDate, DateTime now, CancellationToken cancellationToken = default);

    Task<List<TeamAnalyticsMemberResult>> GetTeamActiveMembersAnalyticsAsync(
        int teamId, DateTime startDate, DateTime endDate, int take, CancellationToken cancellationToken = default);

    Task<List<TeamOverdueTaskResult>> GetTeamOverdueTasksAsync(
        int teamId, DateTime now, int take, CancellationToken cancellationToken = default);

    Task<List<(DateTime CreatedDate, bool IsCompleted, DateTime? CompletedDate)>> GetActiveTasksForAnalyticsAsync(
        int teamId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    Task<int> ArchiveOldTasksAsync(DateTime twelveMonthsAgo, CancellationToken cancellationToken = default);
    Task<int> HardDeleteOldTasksAsync(DateTime threeYearsAgo, CancellationToken cancellationToken = default);
}
