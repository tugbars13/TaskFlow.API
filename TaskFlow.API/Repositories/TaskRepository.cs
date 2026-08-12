using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

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
        return _context.Tasks
            .AsNoTracking()
            .Include(x => x.AssignedUser)
            .Include(x => x.Assignees).ThenInclude(a => a.User)
            .Include(x => x.Team)
            .Where(x => !x.IsDeleted);
    }
    public async Task<List<TaskItem>> GetAllAsync()
    {
        return await GetActiveTasksQuery()
         .OrderByDescending(x => x.CreatedDate)
         .ToListAsync();
    }
    public async Task<List<TaskItem>> GetAllByUserIdAsync(int userId)
    {
        return await GetActiveTasksQuery()
        .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId))
        .OrderByDescending(x => x.CreatedDate)
        .ToListAsync();
    }
    
    public async Task<List<TaskItem>> GetByTeamIdAsync(int teamId)
    {
        return await GetActiveTasksQuery()
        .Where(x => x.TeamId == teamId)
        .OrderByDescending(x => x.CreatedDate)
        .ToListAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(x => x.AssignedUser)
            .Include(x => x.Assignees).ThenInclude(a => a.User)
            .Include(x => x.Team)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Tasks.AnyAsync(x => x.Id == id && !x.IsDeleted);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Kaydedilen görevi, AssignedUser bilgisiyle birlikte tek sorguda tekrar çek
        return await _context.Tasks
            .Include(t => t.AssignedUser)
            .FirstAsync(t => t.Id == task.Id);
    }

    public async Task<bool> UpdateAsync(int id, TaskItem updatedTask)
    {
        Console.WriteLine($"[TRACE] TaskRepository.UpdateAsync entered. id={id}");
        var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (task == null)
        {
            Console.WriteLine($"[TRACE] TaskRepository: task is null. This means the query didn't find the task for this user.");
            return false;
        }

        task.IsCompleted = updatedTask.IsCompleted;
        task.Status = updatedTask.Status;
        task.CompletedDate = updatedTask.CompletedDate;

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.Priority = updatedTask.Priority;
        task.DueDate = updatedTask.DueDate;
        task.Category = updatedTask.Category;
        task.AssignedUserId = updatedTask.AssignedUserId;

        // Multi-Assignee güncellemeleri
        var existingAssignees = await _context.TaskAssignees.Where(ta => ta.TaskId == id).ToListAsync();
        _context.TaskAssignees.RemoveRange(existingAssignees);

        if (updatedTask.Assignees != null && updatedTask.Assignees.Any())
        {
            foreach (var a in updatedTask.Assignees)
            {
                a.TaskId = id;
                _context.TaskAssignees.Add(a);
            }
        }

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (task == null)
            return false;

        task.IsDeleted = true;


        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<TaskItem>> FilterAsync(int userId, TaskFilterDto filter)
    {
        var query = GetActiveTasksQuery()
        .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId));

        if (filter.Priority.HasValue)
        {
            query = query.Where(x => x.Priority == filter.Priority.Value);
        }

        if (filter.Category.HasValue)
        {
            query = query.Where(x => x.Category == filter.Category.Value);
        }

        if (filter.IsCompleted.HasValue)
        {
            query = query.Where(x => x.IsCompleted == filter.IsCompleted.Value);
        }

        return await query
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync();
    }
    public async Task<List<TaskItem>> GetDashboardTasksAsync(int userId)
    {
        return await GetActiveTasksQuery()
            .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId))
            .ToListAsync();
    }

    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        var tasks = await GetActiveTasksQuery()
        .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId))
        .ToListAsync();

        var todayPriorities = tasks
            .OrderBy(x => x.IsCompleted ? 1 : 0)
            .ThenByDescending(x => x.Priority)
            .ThenBy(x => x.DueDate.HasValue ? x.DueDate.Value : DateTime.MaxValue)
            .Take(3)
            .Select(t => new TodayPriorityTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Priority = t.Priority.ToString(),
                IsCompleted = t.IsCompleted,
                CompletedText = t.IsCompleted ? $"Completed at {t.CompletedDate?.ToString("HH:mm") ?? "10:00"}" : null,
                Progress = t.IsCompleted ? 100 : 0,
                Category = t.Category.ToString(),
                DueDate = t.DueDate
            })
            .ToList();

        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
        var dailyTrend = new List<int>();

        for (int i = 0; i < 7; i++)
        {
            var dayDate = startOfWeek.AddDays(i);
            var count = tasks.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value.Date == dayDate);
            dailyTrend.Add(count);
        }

        var weeklyCompleted = tasks.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value.Date >= startOfWeek);
        var prevWeekStart = startOfWeek.AddDays(-7);
        var prevWeekCompleted = tasks.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value.Date >= prevWeekStart && x.CompletedDate.Value.Date < startOfWeek);

        double weeklyChangePercentage = prevWeekCompleted == 0
            ? (weeklyCompleted > 0 ? 100 : 0)
            : Math.Round((double)(weeklyCompleted - prevWeekCompleted) / prevWeekCompleted * 100, 1);

        var productivityPulse = new ProductivityPulseDto
        {
            WeeklyCompletedTasks = weeklyCompleted,
            WeeklyChangePercentage = weeklyChangePercentage,
            DailyCompletionTrend = dailyTrend
        };

        var upcomingDeadlinesItems = tasks
            .Where(x => !x.IsCompleted && !x.IsDeleted && x.DueDate.HasValue && x.DueDate.Value.Date >= DateTime.Today)
            .OrderBy(x => x.DueDate!.Value)
            .Take(5)
            .Select(t => new UpcomingDeadlineDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                Priority = t.Priority.ToString(),
                AssignedUser = t.AssignedUser != null ? t.AssignedUser.FullName : "Alex M.",
                Category = t.Category.ToString()
            })
            .ToList();

        return new DashboardDto
        {
            TotalTasks = tasks.Count,
            CompletedTasks = tasks.Count(x => x.IsCompleted),
            PendingTasks = tasks.Count(x => !x.IsCompleted),
            OverdueTasks = tasks.Count(x => !x.IsCompleted && x.DueDate.HasValue && x.DueDate.Value < DateTime.UtcNow),
            HighPriorityTasks = tasks.Count(x => x.Priority == TaskPriority.High),
            TodayTasks = tasks.Count(x => x.DueDate.HasValue && x.DueDate.Value.Date == DateTime.Today),
            CompletedToday = tasks.Count(x => x.IsCompleted && x.CompletedDate.HasValue && x.CompletedDate.Value.Date == DateTime.Today),
            CompletionRate = tasks.Count == 0 ? 0 : Math.Round((double)tasks.Count(x => x.IsCompleted) / tasks.Count * 100, 2),
            TodayPriorities = todayPriorities,
            ProductivityPulse = productivityPulse,
            UpcomingDeadlinesItems = upcomingDeadlinesItems
        };
    }

    public async Task<List<TaskItem>> SortAsync(int userId, TaskSortDto sort)
    {
        var query = GetActiveTasksQuery()
            .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId));

        var sortBy = sort.SortBy?.ToLower() ?? "createddate";
        var isDescending = sort.IsDescending;

        query = sortBy switch
        {
            "title" => isDescending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "priority" => isDescending ? query.OrderByDescending(x => x.Priority) : query.OrderBy(x => x.Priority),
            "duedate" => isDescending ? query.OrderByDescending(x => x.DueDate) : query.OrderBy(x => x.DueDate),
            _ => isDescending ? query.OrderByDescending(x => x.CreatedDate) : query.OrderBy(x => x.CreatedDate)
        };

        return await query.ToListAsync();
    }

    public async Task<List<TaskItem>> SearchAsync(int userId, string keyword)
    {
        return await GetActiveTasksQuery()
            .Where(x => (x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId)) &&
                (x.Title.Contains(keyword) ||
                 (x.Description != null && x.Description.Contains(keyword))))
            .ToListAsync();
    }

    public async Task<List<TaskItem>> GetPagedAsync(int userId, PaginationDto pagination)
    {
        return await GetActiveTasksQuery()
        .Where(x => x.AssignedUserId == userId || x.Assignees.Any(a => a.UserId == userId))
        .OrderByDescending(x => x.CreatedDate)
        .Skip((pagination.PageNumber - 1) * pagination.PageSize)
        .Take(pagination.PageSize)
        .ToListAsync();
    }
}
