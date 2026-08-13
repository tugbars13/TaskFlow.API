using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetAllByUserIdAsync(int userId, TaskFilterDto filter = null);

    Task<List<TaskItem>> GetAllTasksForAdminAsync();

    Task<List<TaskItem>> GetByTeamIdAsync(int teamId, TaskFilterDto filter = null, int? currentUserId = null);

    Task<TaskItem?> GetByIdAsync(int id);

    Task<TaskItem> CreateAsync(TaskItem task);

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

    Task<DashboardDto> GetDashboardAsync(
        int userId);

    Task<List<TaskItem>> SortAsync(
        int userId,
        TaskSortDto sort);

}