using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class TaskService : ITaskService
{
        private readonly ITaskRepository _repository;
    private readonly IActivityLogService _activityLogService;
    private readonly IServiceProvider _serviceProvider;
    private readonly ITeamAuthorizationService _teamAuth;
    private readonly IDescriptionSanitizerService _descriptionSanitizer;

    public TaskService(
    ITaskRepository repository,
    IActivityLogService activityLogService,
    IServiceProvider serviceProvider,
    ITeamAuthorizationService teamAuth,
    IDescriptionSanitizerService descriptionSanitizer)
    {
        _repository = repository;
        _activityLogService = activityLogService;
        _serviceProvider = serviceProvider;
        _teamAuth = teamAuth;
        _descriptionSanitizer = descriptionSanitizer;
    }

        private async Task InvalidateProfileAsync(int userId)
    {
        using var scope = _serviceProvider.CreateScope();
        var profileService = scope.ServiceProvider.GetRequiredService<IUserBehaviorProfileService>();
        await profileService.InvalidateProfileAsync(userId);
    }

    public async Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskFilterDto? filter = null)
    {
        return await _repository.GetAllByUserIdAsync(userId, filter);
    }
    
    public async Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskFilterDto? filter = null, int? currentUserId = null)
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

        public async Task<TaskItem> CreateTaskAsync(int userId, TaskFlow.API.DTOs.CreateTaskDto dto, bool isAdmin)
    {
        if (dto.TeamId.HasValue)
        {
            var canCreate = await _teamAuth.CanCreateTaskForTeamAsync(dto.TeamId.Value, userId);
            if (!canCreate) throw new UnauthorizedAccessException("Bu takıma görev ekleme yetkiniz yok.");
        }

        var assignees = new List<TaskAssignee>();

        var effectiveAssignees = dto.AssigneeIds ?? new List<int>();
        if (dto.AssignedUserId.HasValue && !effectiveAssignees.Contains(dto.AssignedUserId.Value))
        {
            effectiveAssignees = effectiveAssignees.ToList();
            effectiveAssignees.Add(dto.AssignedUserId.Value);
        }
        if (effectiveAssignees.Any())
        {
            if (!dto.TeamId.HasValue) throw new ArgumentException("Kullanıcı atamak için takım belirtmelisiniz.");
            var distinctIds = effectiveAssignees.Distinct();
            foreach (var assigneeId in distinctIds)
            {
                var isMember = await _teamAuth.IsTeamMemberOrCreatorAsync(dto.TeamId.Value, assigneeId);
                if (!isMember) throw new ArgumentException($"Geçersiz kullanıcı ataması: {assigneeId}");
                assignees.Add(new TaskAssignee { UserId = assigneeId });
            }
        }

        if (dto.ParentTaskId.HasValue)
        {
            var parentTask = await GetByIdAsync(dto.ParentTaskId.Value);
            if (parentTask == null || !await _teamAuth.CanManageTaskAsync(parentTask, userId, isAdmin))
                throw new ArgumentException("Geçersiz veya yetkisiz Parent Task.");
        }

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = _descriptionSanitizer.Sanitize(dto.Description),
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            CategoryId = dto.CategoryId,

            TeamId = dto.TeamId,
            UserId = userId,
            CreatedDate = DateTime.UtcNow,
            IsDeleted = false,
            Assignees = assignees,
            ParentTaskId = dto.ParentTaskId
        };

        return await CreateAsync(task);
    }

    public async Task<TaskItem?> UpdateTaskAsync(int id, int userId, TaskFlow.API.DTOs.UpdateTaskDto dto, bool isAdmin)
    {
        var task = await _repository.GetByIdTrackingAsync(id);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin)) return null;

        List<TaskAssignee>? newAssignees = null;
        var effectiveUpdateAssignees = dto.AssigneeIds;
        if (dto.AssignedUserId.HasValue)
        {
            var list = effectiveUpdateAssignees?.ToList() ?? new List<int>();
            if (!list.Contains(dto.AssignedUserId.Value)) list.Add(dto.AssignedUserId.Value);
            effectiveUpdateAssignees = list;
        }
        if (effectiveUpdateAssignees != null)
        {
            newAssignees = new List<TaskAssignee>();
            if (task.TeamId.HasValue)
            {
                var distinctIds = effectiveUpdateAssignees.Distinct();
                foreach (var assigneeId in distinctIds)
                {
                    var isMember = await _teamAuth.IsTeamMemberOrCreatorAsync(task.TeamId.Value, assigneeId);
                    if (!isMember) throw new ArgumentException($"Geçersiz kullanıcı ataması: {assigneeId}");
                    newAssignees.Add(new TaskAssignee { TaskId = id, UserId = assigneeId });
                }
            }
        }

        task.Title = dto.Title;
        task.Description = _descriptionSanitizer.Sanitize(dto.Description);

        bool isCompleted = dto.Status == TaskFlow.API.Models.TaskStatus.Completed || dto.IsCompleted;
        task.IsCompleted = isCompleted;
        task.Status = dto.Status != 0 ? dto.Status : (isCompleted ? TaskFlow.API.Models.TaskStatus.Completed : TaskFlow.API.Models.TaskStatus.Backlog);

        if (isCompleted && task.CompletedDate == null) task.CompletedDate = DateTime.UtcNow;
        else if (!isCompleted) task.CompletedDate = null;

        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;
        Console.WriteLine($"TASK CategoryId AFTER ASSIGN: {task.CategoryId}");

        if (newAssignees != null)
        {
            task.Assignees.Clear();
            foreach (var a in newAssignees) task.Assignees.Add(a);
        }

        var result = await _repository.UpdateTaskAsync(task);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Update Task", $"'{task.Title}' isimli görev güncellendi.");
            await InvalidateProfileAsync(userId);
            return await _repository.GetByIdAsync(id);
        }
        return null;
    }

            public async Task<bool?> ToggleTaskAsync(int id, int userId, bool isAdmin)
    {
        var task = await _repository.GetByIdTrackingAsync(id);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin)) return null;

        task.IsCompleted = !task.IsCompleted;
        if (task.IsCompleted && task.CompletedDate == null) task.CompletedDate = DateTime.UtcNow;
        else if (!task.IsCompleted) task.CompletedDate = null;

        task.Status = task.IsCompleted ? TaskFlow.API.Models.TaskStatus.Completed : TaskFlow.API.Models.TaskStatus.Backlog;

        var result = await _repository.UpdateTaskAsync(task);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Toggle Task", $"'{task.Title}' isimli görev durumu değiştirildi.");
            await InvalidateProfileAsync(userId);
            return task.IsCompleted;
        }
        return null;
    }

    public async Task<bool> DeleteTaskAsync(int id, int userId, bool isAdmin)
    {
        var task = await _repository.GetByIdTrackingAsync(id);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin)) return false;

        var result = await _repository.DeleteTaskAsync(task);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Delete Task", $"'{task.Title}' isimli görev silindi.");
            await InvalidateProfileAsync(userId);
        }
        return result;
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
            $"'{createdTask.Title}' isimli gÃ¶rev oluÅŸturuldu.");

        await InvalidateProfileAsync(createdTask.UserId);
        return createdTask;
    }

    // GÃ¶revi gÃ¼nceller.
    // Ã–nce gÃ¶revin gerÃ§ekten bu kullanÄ±cÄ±ya ait olup olmadÄ±ÄŸÄ±nÄ± kontrol eder.
    public async Task<bool> UpdateAsync(
        int id,
        int userId,
        TaskItem updatedTask)
    {
        
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
                $"'{updatedTask.Title}' isimli gÃ¶rev gÃ¼ncellendi.");
        }

        if (result) await InvalidateProfileAsync(userId);
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
                $"'{task.Title}' isimli gÃ¶rev silindi.");
        }

        if (result) await InvalidateProfileAsync(userId);
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
        public async Task<int> GetSubtaskCountAsync(int parentTaskId)
    {
        return await _repository.GetSubtaskCountAsync(parentTaskId);
    }

    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        return await _repository.GetDashboardAsync(userId);
    }
    public async Task<List<TaskItem>> SortAsync(
    int userId,
    TaskSortDto sort)
    {
        return await _repository.SortAsync(userId, sort);
    }

}

