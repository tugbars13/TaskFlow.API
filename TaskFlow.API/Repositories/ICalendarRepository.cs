using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Repositories;

public interface ICalendarRepository
{
    Task<List<TaskItem>> GetTasksForCalendarAsync(int userId, CancellationToken cancellationToken = default);
}
