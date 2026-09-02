using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories.Results;

namespace TaskFlow.API.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }
    private IQueryable<TaskItem> GetActiveTasksQuery()
    {
        var archiveDate = DateTime.UtcNow.AddDays(-30);

        return _context.Tasks
            .AsNoTracking()
            .Include(x => x.Assignees).ThenInclude(a => a.User)
            .Include(x => x.Team)
            .Where(x => !x.IsDeleted && !x.IsArchived &&
                        (!x.IsCompleted ||
                         x.CompletedDate == null ||
                         x.CompletedDate >= archiveDate));
    }
    public async Task<List<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveTasksQuery()
         .OrderByDescending(x => x.CreatedDate)
         .ToListAsync(cancellationToken);
    }
    private IQueryable<TaskItem> ApplyFilters(IQueryable<TaskItem> query, TaskQueryParameters? filter, int? currentUserId = null)
    {
        if (filter == null) return query;

        if (filter.Priority.HasValue)
            query = query.Where(x => x.Priority == (TaskPriority)filter.Priority.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(x => x.CategoryId == filter.CategoryId.Value);

        if (filter.IsCompleted.HasValue)
            query = query.Where(x => x.IsCompleted == filter.IsCompleted.Value);

        if (filter.Status.HasValue)
            query = query.Where(x => x.Status == (TaskFlow.API.Models.TaskStatus)filter.Status.Value);

        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var k = filter.Keyword.ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(k) || (x.Description != null && x.Description.ToLower().Contains(k)));
        }

        if (filter.AssigneeIsMe && currentUserId.HasValue)
        {
            query = query.Where(x => x.Assignees.Any(a => a.UserId == currentUserId.Value));
        }
        else if (filter.AssigneeUnassigned)
        {
            query = query.Where(x => !x.Assignees.Any());
        }
        else if (filter.AssigneeId.HasValue)
        {
            query = query.Where(x => x.Assignees.Any(a => a.UserId == filter.AssigneeId.Value));
        }

        if (filter.NoDueDate)
        {
            query = query.Where(x => !x.DueDate.HasValue);
        }
        else
        {
            if (filter.DueBefore.HasValue)
            {
                query = query.Where(x => x.DueDate.HasValue && x.DueDate.Value < filter.DueBefore.Value);
            }
            if (filter.DueAfter.HasValue)
            {
                query = query.Where(x => x.DueDate.HasValue && x.DueDate.Value >= filter.DueAfter.Value);
            }
        }

        return query;
    }

    public async Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskQueryParameters? parameters = null, CancellationToken cancellationToken = default)
    {
        var query = GetActiveTasksQuery()
            .Where(x =>
                (x.TeamId == null && x.UserId == userId) ||

                x.Assignees.Any(a => a.UserId == userId) ||
                (x.ParentTaskId != null && (
                    (x.ParentTask!.TeamId == null && x.ParentTask.UserId == userId) ||

                    x.ParentTask.Assignees.Any(a => a.UserId == userId)
                ))
            );

        query = ApplyFilters(query, parameters, userId);

        int pageNumber = parameters?.PageNumber > 0 ? parameters.PageNumber : 1;
        int pageSize = parameters?.PageSize > 0 ? parameters.PageSize : 50;

        return await query
            .OrderByDescending(x => x.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskQueryParameters? parameters = null, int? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var query = GetActiveTasksQuery()
            .Where(x => x.TeamId == teamId);

        query = ApplyFilters(query, parameters, currentUserId);

        int pageNumber = parameters?.PageNumber > 0 ? parameters.PageNumber : 1;
        int pageSize = parameters?.PageSize > 0 ? parameters.PageSize : 50;

        return await query
            .OrderByDescending(x => x.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(x => x.Assignees).ThenInclude(a => a.User)
            .Include(x => x.Team)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks.AnyAsync(x => x.Id == id && !x.IsDeleted);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await _context.Tasks.AddAsync(task, cancellationToken);
        return task;
    }

    public async Task<TaskItem?> GetByIdTrackingAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .Include(x => x.Assignees).ThenInclude(a => a.User)
            .Include(x => x.Team)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }

    public async Task<bool> UpdateTaskAsync(TaskItem task, CancellationToken cancellationToken = default)
    {

        return true;
    }

    public async Task<bool> DeleteTaskAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        task.IsDeleted = true;

        return true;
    }

    public async Task<int> GetSubtaskCountAsync(int parentTaskId, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks.CountAsync(t => t.ParentTaskId == parentTaskId && !t.IsDeleted);
    }

    public async Task<bool> UpdateAsync(int id, TaskItem updatedTask, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);

        if (task == null)
        {
            Console.WriteLine("[TRACE] TaskRepository: task is null. This means the query didn't find the task for this user.");
            return false;
        }

        task.IsCompleted = updatedTask.IsCompleted;
        task.Status = updatedTask.Status;
        task.CompletedDate = updatedTask.CompletedDate;

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.Priority = updatedTask.Priority;
        task.DueDate = updatedTask.DueDate;
        task.CategoryId = updatedTask.CategoryId;
        // Sadece Assignees listesi açıkça gönderilmişse güncelle (null değilse)
        if (updatedTask.Assignees != null)
        {
            var existingAssignees = await _context.TaskAssignees.Where(ta => ta.TaskId == id).ToListAsync(cancellationToken);
            _context.TaskAssignees.RemoveRange(existingAssignees);

            if (updatedTask.Assignees.Any())
            {
                foreach (var a in updatedTask.Assignees)
                {
                    _context.TaskAssignees.Add(new TaskAssignee
                    {
                        TaskId = id,
                        UserId = a.UserId
                    });
                }
            }
        }



        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);

        if (task == null)
            return false;

        task.IsDeleted = true;




        return true;
    }

    public async Task<List<TaskItem>> FilterAsync(int userId, int? priority, int? categoryId, bool? isCompleted, CancellationToken cancellationToken = default)
    {
        var query = GetActiveTasksQuery()
        .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId));

        if (priority.HasValue)
            query = query.Where(x => x.Priority == (TaskPriority)priority.Value);

        if (categoryId.HasValue)
            query = query.Where(x => x.CategoryId == categoryId.Value);

        if (isCompleted.HasValue)
            query = query.Where(x => x.IsCompleted == isCompleted.Value);

        return await query
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }
    public async Task<(int Total, int Completed, int Pending, int Overdue, int HighPriority, int Today, int CompletedToday, int WeeklyCompleted, int PrevWeekCompleted)> GetDashboardMetricsAsync(
        int userId, DateTime now, DateTime todayDate, DateTime weekStartDate, DateTime prevWeekStartDate, CancellationToken cancellationToken = default)
    {
        var baseQuery = GetActiveTasksQuery()
            .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId));

        // Note: Using multiple CountAsync concurrently or returning a single projected query
        var total = await baseQuery.CountAsync(cancellationToken);
        var completed = await baseQuery.CountAsync(x => x.IsCompleted, cancellationToken);
        var pending = await baseQuery.CountAsync(x => !x.IsCompleted, cancellationToken);
        var overdue = await baseQuery.CountAsync(x => !x.IsCompleted && x.DueDate.HasValue && x.DueDate.Value < now, cancellationToken);
        var highPriority = await baseQuery.CountAsync(x => x.Priority == TaskPriority.High, cancellationToken);

        var todayEnd = todayDate.AddDays(1);
        var today = await baseQuery.CountAsync(x => x.DueDate.HasValue && x.DueDate.Value >= todayDate && x.DueDate.Value < todayEnd, cancellationToken);
        var completedToday = await baseQuery.CountAsync(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value >= todayDate && x.CompletedDate.Value < todayEnd, cancellationToken);

        var weekly = await baseQuery.CountAsync(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value >= weekStartDate, cancellationToken);
        var prevWeekly = await baseQuery.CountAsync(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value >= prevWeekStartDate && x.CompletedDate.Value < weekStartDate, cancellationToken);

        return (total, completed, pending, overdue, highPriority, today, completedToday, weekly, prevWeekly);
    }

    public async Task<Dictionary<DateTime, int>> GetDailyCompletionTrendAsync(int userId, DateTime startDate, int days, CancellationToken cancellationToken = default)
    {
        var query = GetActiveTasksQuery()
            .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId))
            .Where(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value >= startDate);

        var tasks = await query
            .Select(x => x.CompletedDate!.Value)
            .ToListAsync(cancellationToken);

        var result = new Dictionary<DateTime, int>();
        for (int i = 0; i < days; i++)
        {
            var dayDate = startDate.AddDays(i).Date;
            result[dayDate] = tasks.Count(x => x.Date == dayDate);
        }
        return result;
    }

    public async Task<List<TaskItem>> GetTopPriorityTasksAsync(int userId, int limit, CancellationToken cancellationToken = default)
    {
        return await GetActiveTasksQuery()
            .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId))
            .OrderBy(x => x.IsCompleted ? 1 : 0)
            .ThenByDescending(x => x.Priority)
            .ThenBy(x => x.DueDate)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TaskItem>> GetUpcomingDeadlinesAsync(int userId, DateTime fromDate, int limit, CancellationToken cancellationToken = default)
    {
        return await GetActiveTasksQuery()
            .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId))
            .Where(x => !x.IsCompleted && !x.IsDeleted && x.DueDate.HasValue && x.DueDate.Value >= fromDate)
            .OrderBy(x => x.DueDate)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int CompletedTasks, int InProgressTasks, int OverdueTasks, int CurrentTotal, int PrevCompletedTasks, int PrevTotal)> GetTeamAnalyticsMetricsAsync(
        int teamId, DateTime startDate, DateTime endDate, DateTime prevStartDate, DateTime prevEndDate, DateTime now, CancellationToken cancellationToken = default)
    {
        var activeQuery = _context.Tasks.Where(t => t.TeamId == teamId && !t.IsDeleted && t.CreatedDate <= endDate && (!t.IsCompleted || t.CompletedDate >= startDate));
        var prevActiveQuery = _context.Tasks.Where(t => t.TeamId == teamId && !t.IsDeleted && t.CreatedDate <= prevEndDate && (!t.IsCompleted || t.CompletedDate >= prevStartDate));

        var completedTasks = await activeQuery.CountAsync(t => t.IsCompleted && t.CompletedDate >= startDate && t.CompletedDate <= endDate, cancellationToken);
        var inProgressTasks = await activeQuery.CountAsync(t => !t.IsCompleted || t.CompletedDate > endDate, cancellationToken);
        var overdueTasks = await activeQuery.CountAsync(t => !t.IsCompleted && t.DueDate != null && t.DueDate < now, cancellationToken);
        var currentTotal = await activeQuery.CountAsync(cancellationToken);

        var prevCompletedTasks = await prevActiveQuery.CountAsync(t => t.IsCompleted && t.CompletedDate >= prevStartDate && t.CompletedDate <= prevEndDate, cancellationToken);
        var prevTotal = await prevActiveQuery.CountAsync(cancellationToken);

        return (completedTasks, inProgressTasks, overdueTasks, currentTotal, prevCompletedTasks, prevTotal);
    }

    public async Task<List<TeamAnalyticsMemberResult>> GetTeamActiveMembersAnalyticsAsync(
        int teamId, DateTime startDate, DateTime endDate, int take, CancellationToken cancellationToken = default)
    {
        var members = await _context.TaskAssignees
            .Where(a => a.Task.TeamId == teamId && !a.Task.IsDeleted && a.UserId != null &&
                        a.Task.CreatedDate <= endDate && (!a.Task.IsCompleted || a.Task.CompletedDate >= startDate))
            .GroupBy(a => new { a.UserId, a.User.FullName })
            .Select(g => new
            {
                UserId = g.Key.UserId!.Value,
                FullName = g.Key.FullName,
                TotalTasks = g.Count(),
                CompletedTasks = g.Count(a => a.Task.IsCompleted && a.Task.CompletedDate >= startDate && a.Task.CompletedDate <= endDate),
                InProgressTasks = g.Count(a => !a.Task.IsCompleted || a.Task.CompletedDate > endDate)
            })
            .OrderByDescending(x => x.TotalTasks)
            .Take(take)
            .ToListAsync(cancellationToken);

        return members.Select(m => new TeamAnalyticsMemberResult
        {
            UserId = m.UserId,
            FullName = m.FullName,
            TotalTasks = m.TotalTasks,
            CompletedTasks = m.CompletedTasks,
            InProgressTasks = m.InProgressTasks
        }).ToList();
    }

    public async Task<List<TeamOverdueTaskResult>> GetTeamOverdueTasksAsync(
        int teamId, DateTime now, int take, CancellationToken cancellationToken = default)
    {
        var tasks = await _context.Tasks
            .Where(t => t.TeamId == teamId && !t.IsDeleted && !t.IsCompleted && t.DueDate != null && t.DueDate < now)
            .OrderBy(t => t.DueDate)
            .Take(take)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.DueDate,
                Assignees = t.Assignees.Select(a => a.User.FullName).ToList()
            })
            .ToListAsync(cancellationToken);

        return tasks.Select(t => new TeamOverdueTaskResult
        {
            TaskId = t.Id,
            Title = t.Title,
            DueDate = t.DueDate,
            Assignees = t.Assignees
        }).ToList();
    }

    public async Task<List<(DateTime CreatedDate, bool IsCompleted, DateTime? CompletedDate)>> GetActiveTasksForAnalyticsAsync(
        int teamId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var tasks = await _context.Tasks
            .Where(t => t.TeamId == teamId && !t.IsDeleted &&
                        t.CreatedDate <= endDate &&
                        (!t.IsCompleted || t.CompletedDate >= startDate))
            .Select(t => new { t.CreatedDate, t.IsCompleted, t.CompletedDate })
            .ToListAsync(cancellationToken);

        return tasks.Select(t => (t.CreatedDate, t.IsCompleted, t.CompletedDate)).ToList();
    }

    public async Task<int> ArchiveOldTasksAsync(DateTime twelveMonthsAgo, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .Where(t => !t.IsArchived &&
                        ((t.IsCompleted && t.CompletedDate < twelveMonthsAgo) ||
                         (!t.IsCompleted && t.CreatedDate < twelveMonthsAgo)))
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsArchived, true), cancellationToken);
    }

    public async Task<int> HardDeleteOldTasksAsync(DateTime threeYearsAgo, CancellationToken cancellationToken = default)
    {
        int deletedSubTasks = await _context.Tasks
            .Where(t => t.ParentTaskId != null &&
                        ((t.ParentTask!.IsCompleted && t.ParentTask.CompletedDate < threeYearsAgo) ||
                         (!t.ParentTask.IsCompleted && t.ParentTask.CreatedDate < threeYearsAgo)))
            .ExecuteDeleteAsync(cancellationToken);

        int deletedParentTasks = await _context.Tasks
            .Where(t => t.ParentTaskId == null &&
                        ((t.IsCompleted && t.CompletedDate < threeYearsAgo) ||
                         (!t.IsCompleted && t.CreatedDate < threeYearsAgo)))
            .ExecuteDeleteAsync(cancellationToken);

        return deletedSubTasks + deletedParentTasks;
    }

    public async Task<List<TaskItem>> SortAsync(int userId, string? sortByParam, bool isDescending, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var query = GetActiveTasksQuery()
            .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId));

        var sortBy = sortByParam?.ToLower() ?? "createddate";

        query = sortBy switch
        {
            "title" => isDescending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "priority" => isDescending ? query.OrderByDescending(x => x.Priority) : query.OrderBy(x => x.Priority),
            "duedate" => isDescending ? query.OrderByDescending(x => x.DueDate) : query.OrderBy(x => x.DueDate),
            _ => isDescending ? query.OrderByDescending(x => x.CreatedDate) : query.OrderBy(x => x.CreatedDate)
        };

        return await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TaskItem>> SearchAsync(int userId, string keyword, CancellationToken cancellationToken = default)
    {
        return await GetActiveTasksQuery()
            .Where(x => ((x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId)) &&
                (x.Title.Contains(keyword) ||
                 (x.Description != null && x.Description.Contains(keyword))))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TaskItem>> GetPagedAsync(int userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return await GetActiveTasksQuery()
        .Where(x => (x.TeamId == null && x.UserId == userId) || x.Assignees.Any(a => a.UserId == userId))
        .OrderByDescending(x => x.CreatedDate)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync(cancellationToken);
    }
    public async Task DeleteTaskAssigneesByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        await _context.TaskAssignees
            .Where(ta => ta.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteTasksByTeamIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        await _context.Tasks
            .Where(t => t.TeamId == teamId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task<List<TaskItem>> GetTasksForUserBehaviorProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Assignees)
            .Include(t => t.Team)
            .Where(t =>
                !t.IsDeleted &&
                (
                    (t.TeamId == null && t.UserId == userId) ||
                    t.Assignees.Any(a => a.UserId == userId)
                ))
            .ToListAsync(cancellationToken);
    }
}
