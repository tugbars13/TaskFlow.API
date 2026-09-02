// Services/IActivityService.cs
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface IActivityService
{
    Task<List<ActivityLog>> GetLogsByUserIdAsync(int userId, CancellationToken cancellationToken = default);
}