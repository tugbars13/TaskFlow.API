using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Repositories;
using TaskFlow.API.Models;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ActivityLogService(IActivityLogRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task LogAsync(int userId, string action, string description, CancellationToken cancellationToken = default)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            Description = description,
            CreatedDate = DateTime.UtcNow
        };

        await _repository.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}