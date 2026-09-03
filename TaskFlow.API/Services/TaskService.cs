using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;
namespace TaskFlow.API.Services;

public class TaskService : ITaskService
{
    private readonly IAiService _aiService;
    private readonly IUserBehaviorProfileService _profileService;
    private readonly ITaskRepository _repository;
    private readonly IActivityLogService _activityLogService;
    private readonly ITeamAuthorizationService _teamAuth;
    private readonly IDescriptionSanitizerService _descriptionSanitizer;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public TaskService(
    ITaskRepository repository,
    IActivityLogService activityLogService,
    ITeamAuthorizationService teamAuth,
    IDescriptionSanitizerService descriptionSanitizer,
    IUserBehaviorProfileService profileService,
    IAiService aiService,
    IUserRepository userRepository,
    INotificationService notificationService,
    IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _activityLogService = activityLogService;
        _teamAuth = teamAuth;
        _descriptionSanitizer = descriptionSanitizer;
        _profileService = profileService;
        _aiService = aiService;
        _userRepository = userRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    private TaskDto MapToDto(TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description ?? string.Empty,
            IsCompleted = task.IsCompleted,
            Status = task.Status == 0 ? (task.IsCompleted ? TaskFlow.API.Models.TaskStatus.Completed : TaskFlow.API.Models.TaskStatus.Backlog) : task.Status,
            CreatedDate = task.CreatedDate,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CategoryId = task.CategoryId,
            Category = task.Category != null ? task.Category.Name : "",
            Progress = task.IsCompleted ? 100 : (task.Status == TaskFlow.API.Models.TaskStatus.InProgress ? 75 : task.Status == TaskFlow.API.Models.TaskStatus.ToDo ? 25 : 0),
            CommentsCount = 2,
            AttachmentsCount = 1,
            AssignedUserId = task.Assignees?.FirstOrDefault()?.UserId,
            AssignedUserFullName = task.Assignees?.FirstOrDefault()?.User?.FullName,
            AssignedUserAvatar = task.Assignees?.FirstOrDefault()?.User?.AvatarUrl,
            Assignees = task.Assignees?.Select(a => new AssigneeDto
            {
                Id = a.UserId ?? 0,
                FullName = a.User?.FullName ?? string.Empty,
                AvatarUrl = a.User?.AvatarUrl
            }).ToList() ?? new List<AssigneeDto>(),
            TeamId = task.TeamId,
            TeamName = task.Team?.Name,
            ParentTaskId = task.ParentTaskId
        };
    }

    private TaskQueryParameters? MapToQueryParameters(TaskFilterDto? filter)
    {
        if (filter == null) return null;
        var p = new TaskQueryParameters
        {
            Priority = (int?)filter.Priority,
            CategoryId = filter.CategoryId,
            IsCompleted = filter.IsCompleted,
            Status = (int?)filter.Status,
            Keyword = filter.Keyword,
            PageNumber = filter.PageNumber > 0 ? filter.PageNumber : 1,
            PageSize = filter.PageSize > 0 ? filter.PageSize : 50
        };

        if (!string.IsNullOrWhiteSpace(filter.AssigneeId))
        {
            if (filter.AssigneeId == "Me") p.AssigneeIsMe = true;
            else if (filter.AssigneeId == "Unassigned") p.AssigneeUnassigned = true;
            else if (int.TryParse(filter.AssigneeId, out int aId)) p.AssigneeId = aId;
        }

        if (!string.IsNullOrWhiteSpace(filter.DueDateRange))
        {
            var today = DateTime.UtcNow.AddHours(3).Date;
            switch (filter.DueDateRange)
            {
                case "Overdue":
                    p.IsCompleted = false;
                    p.DueBefore = today;
                    break;
                case "Today":
                    p.DueAfter = today;
                    p.DueBefore = today.AddDays(1);
                    break;
                case "ThisWeek":
                    p.DueAfter = today;
                    p.DueBefore = today.AddDays(8);
                    break;
                case "NoDueDate":
                    p.NoDueDate = true;
                    break;
            }
        }
        return p;
    }

    public async Task<List<TaskDto>> GetAllByUserIdAsync(int userId, TaskFilterDto? filter = null, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetAllByUserIdAsync(userId, MapToQueryParameters(filter), cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<List<TaskDto>> GetByTeamIdAsync(int teamId, TaskFilterDto? filter = null, int? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetByTeamIdAsync(teamId, MapToQueryParameters(filter), currentUserId, cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }
    public async Task<List<TaskDto>> GetAllTasksForAdminAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetAllAsync(cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }
    public async Task<TaskDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdAsync(id, cancellationToken);
        return task == null ? null : MapToDto(task);
    }
    public async Task<TaskItem?> GetEntityByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<TaskDto> CreateTaskAsync(int userId, TaskFlow.API.DTOs.CreateTaskDto dto, bool isAdmin, CancellationToken cancellationToken = default)
    {
        if (dto.TeamId.HasValue)
        {
            var canCreate = await _teamAuth.CanCreateTaskForTeamAsync(dto.TeamId.Value, userId, cancellationToken);
            if (!canCreate) throw new UnauthorizedAccessException("Bu takÄ±ma gÃ¶rev ekleme yetkiniz yok.");
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
            if (!dto.TeamId.HasValue) throw new ArgumentException("KullanÄ±cÄ± atamak iÃ§in takÄ±m belirtmelisiniz.");
            var distinctIds = effectiveAssignees.Distinct();
            foreach (var assigneeId in distinctIds)
            {
                var isMember = await _teamAuth.IsTeamMemberOrCreatorAsync(dto.TeamId.Value, assigneeId, cancellationToken);
                if (!isMember) throw new ArgumentException($"GeÃ§ersiz kullanÄ±cÄ± atamasÄ±: {assigneeId}");
                assignees.Add(new TaskAssignee { UserId = assigneeId });
            }
        }

        if (dto.ParentTaskId.HasValue)
        {
            var parentTask = await GetEntityByIdAsync(dto.ParentTaskId.Value, cancellationToken);
            if (parentTask == null || !await _teamAuth.CanManageTaskAsync(parentTask, userId, isAdmin, cancellationToken))
                throw new ArgumentException("GeÃ§ersiz veya yetkisiz Parent Task.");
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

        return await CreateAsync(task, cancellationToken);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, int userId, TaskFlow.API.DTOs.UpdateTaskDto dto, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdTrackingAsync(id, cancellationToken);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin, cancellationToken)) return null;

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
                    var isMember = await _teamAuth.IsTeamMemberOrCreatorAsync(task.TeamId.Value, assigneeId, cancellationToken);
                    if (!isMember) throw new ArgumentException($"GeÃ§ersiz kullanÄ±cÄ± atamasÄ±: {assigneeId}");
                    newAssignees.Add(new TaskAssignee { TaskId = id, UserId = assigneeId });
                }
            }
        }

        task.Title = dto.Title;
        task.Description = _descriptionSanitizer.Sanitize(dto.Description);

        bool wasCompleted = task.IsCompleted;
        bool isCompleted = dto.Status == TaskFlow.API.Models.TaskStatus.Completed || dto.IsCompleted;
        task.IsCompleted = isCompleted;
        task.Status = dto.Status != 0 ? dto.Status : (isCompleted ? TaskFlow.API.Models.TaskStatus.Completed : TaskFlow.API.Models.TaskStatus.Backlog);

        if (isCompleted && task.CompletedDate == null) task.CompletedDate = DateTime.UtcNow;
        else if (!isCompleted) task.CompletedDate = null;

        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;

        List<int> newAssignedUserIds = new List<int>();

        if (newAssignees != null)
        {
            var oldAssigneeIds = task.Assignees.Where(a => a.UserId.HasValue).Select(a => a.UserId.Value).ToList();
            var incomingAssigneeIds = newAssignees.Where(a => a.UserId.HasValue).Select(a => a.UserId.Value).ToList();
            newAssignedUserIds = incomingAssigneeIds.Except(oldAssigneeIds).Where(id => id != userId).ToList();

            task.Assignees.Clear();
            foreach (var a in newAssignees) task.Assignees.Add(a);
        }

        var result = await _repository.UpdateTaskAsync(task, cancellationToken);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Update Task", $"'{task.Title}' isimli gÃ¶rev gÃ¼ncellendi.", cancellationToken);
            await _profileService.InvalidateProfileAsync(userId, cancellationToken);

            var sender = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (sender != null)
            {
                if (newAssignedUserIds.Any())
                {
                    foreach (var assigneeId in newAssignedUserIds)
                    {
                        await _notificationService.SendNotificationAsync(
                            assigneeId,
                            "Yeni GÃ¶rev AtandÄ±",
                            $"{sender.FullName} sizi '{task.Title}' gÃ¶revine atadÄ±.",
                            "TaskAssignment",
                            task.Id,
                            saveChanges: false,
                            cancellationToken);
                    }
                }

                if (wasCompleted != task.IsCompleted && task.Assignees.Count > 1)
                {
                    var type = task.IsCompleted ? "TaskCompleted" : "TaskReopened";
                    var title = task.IsCompleted ? "Ortak GÃ¶rev TamamlandÄ±" : "Ortak GÃ¶rev Yeniden AÃ§Ä±ldÄ±";
                    var message = task.IsCompleted
                        ? $"{sender.FullName} ortak Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ±z '{task.Title}' gÃ¶revini tamamladÄ±."
                        : $"{sender.FullName} ortak Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ±z '{task.Title}' gÃ¶revini yeniden aÃ§tÄ±.";

                    foreach (var assignee in task.Assignees)
                    {
                        if (assignee.UserId.HasValue && assignee.UserId.Value != userId && !newAssignedUserIds.Contains(assignee.UserId.Value))
                        {
                            await _notificationService.SendNotificationAsync(
                                assignee.UserId.Value,
                                title,
                                message,
                                type,
                                task.Id,
                                saveChanges: false,
                                cancellationToken);
                        }
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            var updated = await _repository.GetByIdAsync(id, cancellationToken);
            return updated == null ? null : MapToDto(updated);
        }
        return null;
    }

    public async Task<bool?> ToggleTaskAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdTrackingAsync(id, cancellationToken);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin, cancellationToken)) return null;

        bool wasCompleted = task.IsCompleted;
        task.IsCompleted = !task.IsCompleted;
        if (task.IsCompleted && task.CompletedDate == null) task.CompletedDate = DateTime.UtcNow;
        else if (!task.IsCompleted) task.CompletedDate = null;

        task.Status = task.IsCompleted ? TaskFlow.API.Models.TaskStatus.Completed : TaskFlow.API.Models.TaskStatus.Backlog;

        var result = await _repository.UpdateTaskAsync(task, cancellationToken);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Toggle Task", $"'{task.Title}' isimli gÃ¶rev durumu deÄŸiÅŸtirildi.", cancellationToken);
            await _profileService.InvalidateProfileAsync(userId, cancellationToken);

            if (wasCompleted != task.IsCompleted && task.Assignees != null && task.Assignees.Count > 1)
            {
                var sender = await _userRepository.GetByIdAsync(userId, cancellationToken);
                if (sender != null)
                {
                    var type = task.IsCompleted ? "TaskCompleted" : "TaskReopened";
                    var title = task.IsCompleted ? "Ortak GÃ¶rev TamamlandÄ±" : "Ortak GÃ¶rev Yeniden AÃ§Ä±ldÄ±";
                    var message = task.IsCompleted
                        ? $"{sender.FullName} ortak Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ±z '{task.Title}' gÃ¶revini tamamladÄ±."
                        : $"{sender.FullName} ortak Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ±z '{task.Title}' gÃ¶revini yeniden aÃ§tÄ±.";

                    foreach (var assignee in task.Assignees)
                    {
                        if (assignee.UserId.HasValue && assignee.UserId.Value != userId)
                        {
                            await _notificationService.SendNotificationAsync(
                                assignee.UserId.Value,
                                title,
                                message,
                                type,
                                task.Id,
                                saveChanges: false,
                                cancellationToken);
                        }
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return task.IsCompleted;
        }
        return null;
    }

    public async Task<bool> DeleteTaskAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdTrackingAsync(id, cancellationToken);
        if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin, cancellationToken)) return false;

        var result = await _repository.DeleteTaskAsync(task, cancellationToken);
        if (result)
        {
            await _activityLogService.LogAsync(userId, "Delete Task", $"'{task.Title}' isimli gÃ¶rev silindi.", cancellationToken);
            await _profileService.InvalidateProfileAsync(userId, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        return result;
    }
    public async Task<TaskDto> CreateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        task.CreatedDate = DateTime.UtcNow;

        if (task.IsCompleted && !task.CompletedDate.HasValue)
        {
            task.CompletedDate = DateTime.UtcNow;
        }

        var createdTask = await _repository.CreateAsync(task, cancellationToken);

        var sender = await _userRepository.GetByIdAsync(task.UserId, cancellationToken);
        if (sender != null && task.Assignees != null)
        {
            foreach (var assignee in task.Assignees)
            {
                if (assignee.UserId.HasValue && assignee.UserId.Value != task.UserId)
                {
                    await _notificationService.SendNotificationAsync(
                        assignee.UserId.Value,
                        "Yeni GÃ¶rev AtandÄ±",
                        $"{sender.FullName} sizi '{task.Title}' gÃ¶revine atadÄ±.",
                        "TaskAssignment",
                        createdTask.Id,
                        saveChanges: false,
                        cancellationToken);
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(
            createdTask.UserId,
            "Create Task",
            $"'{createdTask.Title}' isimli gÃ¶rev oluÅŸturuldu.", cancellationToken);

        await _profileService.InvalidateProfileAsync(createdTask.UserId, cancellationToken);

        var fullTask = await _repository.GetByIdAsync(createdTask.Id, cancellationToken);
        return MapToDto(fullTask ?? createdTask);
    }

    public async Task<List<TaskDto>> FilterAsync(
    int userId,
    TaskFilterDto filter, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.FilterAsync(userId, (int?)filter.Priority, filter.CategoryId, filter.IsCompleted, cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }
    public async Task<List<TaskDto>> SearchAsync(
    int userId,
    string keyword, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.SearchAsync(userId, keyword, cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }
    public async Task<List<TaskDto>> GetPagedAsync(
    int userId,
    PaginationDto pagination, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetPagedAsync(userId, pagination.PageNumber, pagination.PageSize, cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }
    public async Task<int> GetSubtaskCountAsync(int parentTaskId, CancellationToken cancellationToken = default)
    {
        return await _repository.GetSubtaskCountAsync(parentTaskId, cancellationToken);
    }

    public async Task<DashboardDto> GetDashboardAsync(int userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var todayDate = now.AddHours(3).Date;
        var startOfWeek = todayDate.AddDays(-((int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1));
        var prevWeekStart = startOfWeek.AddDays(-7);

        var metrics = await _repository.GetDashboardMetricsAsync(userId, now, todayDate, startOfWeek, prevWeekStart, cancellationToken);
        var topPriorities = await _repository.GetTopPriorityTasksAsync(userId, 3, cancellationToken);
        var upcoming = await _repository.GetUpcomingDeadlinesAsync(userId, todayDate, 5, cancellationToken);
        var dailyTrendData = await _repository.GetDailyCompletionTrendAsync(userId, startOfWeek, 7, cancellationToken);

        var todayPrioritiesDto = topPriorities.Select(t => new TodayPriorityTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Priority = t.Priority.ToString(),
            IsCompleted = t.IsCompleted,
            CompletedText = t.IsCompleted ? $"Completed at {t.CompletedDate?.AddHours(3).ToString("HH:mm") ?? "10:00"}" : null,
            Progress = t.IsCompleted ? 100 : 0,
            Category = t.Category?.Name ?? "General",
            CategoryId = t.CategoryId,
            DueDate = t.DueDate
        }).ToList();

        var upcomingDto = upcoming.Select(t => new UpcomingDeadlineDto
        {
            Id = t.Id,
            Title = t.Title,
            DueDate = t.DueDate,
            Priority = t.Priority.ToString(),
            AssignedUser = t.Assignees
                .Select(a => a.User?.FullName)
                .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name)) ?? "Alex M.",
            Category = t.Category?.Name ?? "General",
            CategoryId = t.CategoryId
        }).ToList();

        var dailyTrend = new List<int>();
        for (int i = 0; i < 7; i++)
        {
            var dayDate = startOfWeek.AddDays(i).Date;
            dailyTrend.Add(dailyTrendData.ContainsKey(dayDate) ? dailyTrendData[dayDate] : 0);
        }

        double weeklyChangePercentage = metrics.PrevWeekCompleted == 0
            ? (metrics.WeeklyCompleted > 0 ? 100 : 0)
            : Math.Round((double)(metrics.WeeklyCompleted - metrics.PrevWeekCompleted) / metrics.PrevWeekCompleted * 100, 1);

        return new DashboardDto
        {
            TotalTasks = metrics.Total,
            CompletedTasks = metrics.Completed,
            PendingTasks = metrics.Pending,
            OverdueTasks = metrics.Overdue,
            HighPriorityTasks = metrics.HighPriority,
            TodayTasks = metrics.Today,
            CompletedToday = metrics.CompletedToday,
            CompletionRate = metrics.Total == 0 ? 0 : Math.Round((double)metrics.Completed / metrics.Total * 100, 2),
            TodayPriorities = todayPrioritiesDto,
            ProductivityPulse = new ProductivityPulseDto
            {
                WeeklyCompletedTasks = metrics.WeeklyCompleted,
                WeeklyChangePercentage = weeklyChangePercentage,
                DailyCompletionTrend = dailyTrend
            },
            UpcomingDeadlinesItems = upcomingDto
        };
    }
    public async Task<List<TaskDto>> SortAsync(
    int userId,
    TaskSortDto sort, CancellationToken cancellationToken = default)
    {
        int pageNumber = sort?.PageNumber > 0 ? sort.PageNumber : 1;
        int pageSize = sort?.PageSize > 0 ? sort.PageSize : 50;

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var tasks = await _repository.SortAsync(userId, sort?.SortBy, sort?.IsDescending ?? true, pageNumber, pageSize, cancellationToken);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<List<AiTaskOrderDto>> GenerateTaskOrderAsync(int userId, CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetAllByUserIdAsync(userId, null, cancellationToken);
        var activeTasks = tasks.Where(t => !t.IsCompleted && !t.IsDeleted).ToList();
        if (!activeTasks.Any())
        {
            return new List<AiTaskOrderDto>();
        }

        var profile = await _profileService.GetOrCalculateProfileAsync(userId, cancellationToken);
        var aiResultTasks = await _aiService.GenerateTaskOrderAsync(tasks, profile, cancellationToken);

        var finalOrderedTasks = new List<AiTaskOrderDto>();
        var validTaskIds = new HashSet<int>(activeTasks.Select(t => t.Id));
        var processedTaskIds = new HashSet<int>();

        int currentScore = 95 + (activeTasks.Count % 4);

        foreach (var aiItem in aiResultTasks.OrderBy(x => x.Rank))
        {
            if (!validTaskIds.Contains(aiItem.TaskId) || processedTaskIds.Contains(aiItem.TaskId))
                continue;

            var realTask = activeTasks.First(t => t.Id == aiItem.TaskId);
            int drop = 7;

            if (realTask.Priority == TaskFlow.API.Models.TaskPriority.High) drop -= 3;
            else if (realTask.Priority == TaskFlow.API.Models.TaskPriority.Low) drop += 2;

            if (realTask.DueDate.HasValue)
            {
                var days = (realTask.DueDate.Value - DateTime.UtcNow).TotalDays;
                if (days < 0) drop -= 3;
                else if (days < 2) drop -= 2;
                else if (days > 7) drop += 3;
            }

            if (realTask.Status == TaskFlow.API.Models.TaskStatus.InProgress) drop -= 1;

            if (profile.CategoryBehaviors != null)
            {
                var catPerf = profile.CategoryBehaviors.FirstOrDefault(c => c.CategoryId == realTask.CategoryId);
                if (catPerf != null && (catPerf.LateTasks > 0 || catPerf.ProcrastinatedTasks > 0))
                {
                    drop -= 2;
                }
            }

            if (drop < 1) drop = 1 + (realTask.Id % 2);
            if (drop > 15) drop = 14 + (realTask.Id % 2);

            if (finalOrderedTasks.Count == 0)
            {
                currentScore -= (int)(drop / 2);
                if (currentScore > 99) currentScore = 99;
            }
            else
            {
                currentScore -= drop;
            }
            if (currentScore < 15) currentScore = 15;

            var dto = new AiTaskOrderDto
            {
                TaskId = realTask.Id,
                Title = realTask.Title,
                Priority = realTask.Priority.ToString(),
                DueDate = realTask.DueDate?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Status = realTask.Status.ToString(),
                Category = realTask.Category != null ? realTask.Category.Name : "",
                Rank = aiItem.Rank,
                Score = currentScore,
                Reasoning = aiItem.Reasoning
            };

            finalOrderedTasks.Add(dto);
            processedTaskIds.Add(realTask.Id);
        }

        var missingTasks = activeTasks.Where(t => !processedTaskIds.Contains(t.Id)).ToList();
        if (missingTasks.Any())
        {
            int nextRank = finalOrderedTasks.Any() ? finalOrderedTasks.Max(x => x.Rank) + 1 : 1;
            foreach (var missingTask in missingTasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ThenByDescending(t => t.Priority))
            {
                currentScore -= 8;
                if (currentScore < 5) currentScore = 5;

                finalOrderedTasks.Add(new AiTaskOrderDto
                {
                    TaskId = missingTask.Id,
                    Title = missingTask.Title,
                    Priority = missingTask.Priority.ToString(),
                    DueDate = missingTask.DueDate?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    Status = missingTask.Status.ToString(),
                    Category = missingTask.Category != null ? missingTask.Category.Name : "",
                    Rank = nextRank++,
                    Score = currentScore,
                    Reasoning = "AI deÄŸerlendirmesine girmediÄŸi iÃ§in standart Ã¶nceliÄŸe gÃ¶re sÄ±ralandÄ±."
                });
            }
        }

        return finalOrderedTasks.OrderBy(x => x.Rank).ToList();
    }
}
