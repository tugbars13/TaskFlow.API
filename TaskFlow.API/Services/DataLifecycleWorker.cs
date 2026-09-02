using TaskFlow.API.Repositories;
using TaskFlow.API.Data;

namespace TaskFlow.API.Services;

public class DataLifecycleWorker : BackgroundService
{
    private readonly ILogger<DataLifecycleWorker> _logger;
    private readonly IServiceProvider _serviceProvider;

    public DataLifecycleWorker(ILogger<DataLifecycleWorker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataLifecycleWorker starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDataLifecycleAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during DataLifecycleWorker execution.");
            }

            // Run once a day
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task ProcessDataLifecycleAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var taskRepository = scope.ServiceProvider.GetRequiredService<ITaskRepository>();
        var snapshotRepository = scope.ServiceProvider.GetRequiredService<ITeamAnalyticsSnapshotRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var now = DateTime.UtcNow;
        var twelveMonthsAgo = now.AddMonths(-12);
        var threeYearsAgo = now.AddYears(-3);
        var oneYearAgo = now.AddYears(-1);

        _logger.LogInformation("Starting Data Lifecycle Process...");

        // 1. Archival Process (Last 12 months -> Archive)
        int archivedCount = await taskRepository.ArchiveOldTasksAsync(twelveMonthsAgo, stoppingToken);
        if (archivedCount > 0)
        {
            _logger.LogInformation($"Successfully archived {archivedCount} tasks.");
        }
        else
        {
            _logger.LogInformation("No tasks need archiving today.");
        }

        // 2. Hard Deletion Process (Older than 3 years -> Delete)
        // 3. Snapshot Deletion Process (Older than 1 year -> Delete)
        await unitOfWork.BeginTransactionAsync(stoppingToken);
        try
        {
            int deletedTasksCount = await taskRepository.HardDeleteOldTasksAsync(threeYearsAgo, stoppingToken);
            if (deletedTasksCount > 0)
            {
                _logger.LogInformation($"Successfully hard deleted {deletedTasksCount} old tasks.");
            }
            else
            {
                _logger.LogInformation("No tasks need hard deletion today.");
            }

            int deletedSnapshotsCount = await snapshotRepository.DeleteOldSnapshotsAsync(oneYearAgo, stoppingToken);
            if (deletedSnapshotsCount > 0)
            {
                _logger.LogInformation($"Successfully deleted {deletedSnapshotsCount} expired team analytics snapshots.");
            }
            else
            {
                _logger.LogInformation("No expired team analytics snapshots found.");
            }

            await unitOfWork.CommitTransactionAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackTransactionAsync(stoppingToken);
            _logger.LogError(ex, "Transaction failed during hard deletion. Rolled back.");
            throw;
        }
    }
}
