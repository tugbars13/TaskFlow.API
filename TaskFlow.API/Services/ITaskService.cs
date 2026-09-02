using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetAllByUserIdAsync(int userId, TaskFilterDto? filter = null, CancellationToken cancellationToken = default);

    Task<List<TaskDto>> GetAllTasksForAdminAsync(CancellationToken cancellationToken = default);

    Task<List<TaskDto>> GetByTeamIdAsync(int teamId, TaskFilterDto? filter = null, int? currentUserId = null, CancellationToken cancellationToken = default);

    Task<TaskDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetEntityByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<TaskDto> CreateTaskAsync(int userId, TaskFlow.API.DTOs.CreateTaskDto dto, bool isAdmin, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateAsync(TaskItem task, CancellationToken cancellationToken = default);

    Task<bool?> ToggleTaskAsync(int id, int userId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<TaskDto?> UpdateTaskAsync(
    int id,
    int userId,
    TaskFlow.API.DTOs.UpdateTaskDto dto,
    bool isAdmin, CancellationToken cancellationToken = default);
    Task<bool> DeleteTaskAsync(
    int id,
    int userId,
    bool isAdmin, CancellationToken cancellationToken = default);
    Task<List<AiTaskOrderDto>> GenerateTaskOrderAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> FilterAsync(
        int userId,
        TaskFilterDto filter, CancellationToken cancellationToken = default);

    Task<List<TaskDto>> SearchAsync(
        int userId,
        string keyword, CancellationToken cancellationToken = default);

    Task<List<TaskDto>> GetPagedAsync(
        int userId,
        PaginationDto pagination, CancellationToken cancellationToken = default);

    Task<int> GetSubtaskCountAsync(int parentTaskId, CancellationToken cancellationToken = default);

    Task<DashboardDto> GetDashboardAsync(
        int userId, CancellationToken cancellationToken = default);

    Task<List<TaskDto>> SortAsync(
        int userId,
        TaskSortDto sort, CancellationToken cancellationToken = default);

}

