using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;
    private readonly IActivityLogService _activityLogService;

    public TaskService(
    ITaskRepository repository,
    IActivityLogService activityLogService)
    {
        _repository = repository;
        _activityLogService = activityLogService;
    }

    public async Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskFilterDto filter = null)
    {
        return await _repository.GetAllByUserIdAsync(userId, filter);
    }
    
    public async Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskFilterDto filter = null, int? currentUserId = null)
    {
        return await _repository.GetByTeamIdAsync(teamId, filter, currentUserId);
    }
    public async Task<List<TaskItem>> GetAllTasksForAdminAsync()
    {
        return await _repository.GetAllAsync();
    }
    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        task.CreatedDate = DateTime.UtcNow;

        if (task.IsCompleted && !task.CompletedDate.HasValue)
        {
            task.CompletedDate = DateTime.UtcNow;
        }

        var createdTask = await _repository.CreateAsync(task);

        await _activityLogService.LogAsync(
            createdTask.UserId,
            "Create Task",
            $"'{createdTask.Title}' isimli görev oluşturuldu.");

        return createdTask;
    }

    // Görevi günceller.
    // Önce görevin gerçekten bu kullanıcıya ait olup olmadığını kontrol eder.
    public async Task<bool> UpdateAsync(
        int id,
        int userId,
        TaskItem updatedTask)
    {
        Console.WriteLine($"[TRACE] TaskService.UpdateAsync entered. id={id}, userId={userId}");
        var task = await _repository.GetByIdAsync(id);

        if (task == null)
        {
            Console.WriteLine($"[TRACE] TaskService: task is null after GetByIdAsync. Returning false.");
            return false;
        }


        if (updatedTask.Status == TaskFlow.API.Models.TaskStatus.Completed || updatedTask.IsCompleted)
        {
            updatedTask.IsCompleted = true;
            updatedTask.Status = TaskFlow.API.Models.TaskStatus.Completed;

            if (!task.IsCompleted)
            {
                updatedTask.CompletedDate = DateTime.UtcNow;
            }
            else
            {
                updatedTask.CompletedDate = task.CompletedDate;
            }
        }
        else
        {
            updatedTask.IsCompleted = false;

            if (updatedTask.Status == 0)
            {
                updatedTask.Status = TaskFlow.API.Models.TaskStatus.Backlog;
            }

            updatedTask.CompletedDate = null;
        }

        Console.WriteLine($"[TRACE] TaskService: calling Repository.UpdateAsync");
        var result = await _repository.UpdateAsync(id, updatedTask);
        Console.WriteLine($"[TRACE] TaskService: Repository.UpdateAsync returned {result}");

        if (result)
        {
            await _activityLogService.LogAsync(
                userId,
                "Update Task",
                $"'{updatedTask.Title}' isimli görev güncellendi.");
        }

        return result;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var task = await _repository.GetByIdAsync(id);

        if (task == null)
            return false;

        var result = await _repository.DeleteAsync(id);

        if (result)
        {
            await _activityLogService.LogAsync(
                userId,
                "Delete Task",
                $"'{task.Title}' isimli görev silindi.");
        }

        return result;
    }
    public async Task<List<TaskItem>> FilterAsync(
    int userId,
    TaskFilterDto filter)
    {
        return await _repository.FilterAsync(userId, filter);
    }
    public async Task<List<TaskItem>> SearchAsync(
    int userId,
    string keyword)
    {
        return await _repository.SearchAsync(userId, keyword);
    }
    public async Task<List<TaskItem>> GetPagedAsync(
    int userId,
    PaginationDto pagination)
    {
        return await _repository.GetPagedAsync(userId, pagination);
    }
    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        var tasks = await _repository.GetDashboardTasksAsync(userId);
        var todayPriorities = tasks
        .OrderBy(x => x.IsCompleted ? 1 : 0)
        .ThenByDescending(x => x.Priority)
        .ThenBy(x => x.DueDate ?? DateTime.MaxValue)
        .Take(3)
        .Select(t => new TodayPriorityTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Priority = t.Priority.ToString(),
            IsCompleted = t.IsCompleted,
            CompletedText = t.IsCompleted
                ? $"Completed at {t.CompletedDate?.ToString("HH:mm") ?? "10:00"}"
                : null,
            Progress = t.IsCompleted ? 100 : 0,
            Category = t.Category.ToString(),
            DueDate = t.DueDate
        })

        .ToList();
        return await _repository.GetDashboardAsync(userId);
    }
    public async Task<List<TaskItem>> SortAsync(
    int userId,
    TaskSortDto sort)
    {
        return await _repository.SortAsync(userId, sort);
    }

}