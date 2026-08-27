using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskFilterDto? filter = null);

    Task<List<TaskItem>> GetAllTasksForAdminAsync();

    Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskFilterDto? filter = null, int? currentUserId = null);

    Task<TaskItem?> GetByIdAsync(int id);

    Task<TaskItem> CreateTaskAsync(int userId, TaskFlow.API.DTOs.CreateTaskDto dto, bool isAdmin);
    Task<TaskItem> CreateAsync(TaskItem task);

    Task<bool?> ToggleTaskAsync(int id, int userId, bool isAdmin);
    Task<TaskItem?> UpdateTaskAsync(int id, int userId, TaskFlow.API.DTOs.UpdateTaskDto dto, bool isAdmin);
    Task<bool> DeleteTaskAsync(int id, int userId, bool isAdmin);
    Task<bool> UpdateAsync(
        int id,
        int userId,
        TaskItem updatedTask);

    Task<bool> DeleteAsync(
        int id,
        int userId);

    Task<List<TaskItem>> FilterAsync(
        int userId,
        TaskFilterDto filter);

    Task<List<TaskItem>> SearchAsync(
        int userId,
        string keyword);

    Task<List<TaskItem>> GetPagedAsync(
        int userId,
        PaginationDto pagination);

    Task<int> GetSubtaskCountAsync(int parentTaskId);

    Task<DashboardDto> GetDashboardAsync(
        int userId);

    Task<List<TaskItem>> SortAsync(
        int userId,
        TaskSortDto sort);

}

