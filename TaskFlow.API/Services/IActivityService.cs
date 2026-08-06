// Services/IActivityService.cs
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface IActivityService
{
    Task<List<ActivityLog>> GetLogsByUserIdAsync(int userId);
}