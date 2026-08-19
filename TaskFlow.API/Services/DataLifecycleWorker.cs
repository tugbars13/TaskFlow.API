using Microsoft.EntityFrameworkCore;
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
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var twelveMonthsAgo = now.AddMonths(-12);
        var threeYearsAgo = now.AddYears(-3);

        _logger.LogInformation("Starting Data Lifecycle Process...");

        // 1. Archival Process (Last 12 months -> Archive)
        var tasksToArchive = await context.Tasks
            .Where(t => !t.IsArchived &&
                        ((t.IsCompleted && t.CompletedDate < twelveMonthsAgo) ||
                         (!t.IsCompleted && t.CreatedDate < twelveMonthsAgo)))
            .ToListAsync(stoppingToken);

        if (tasksToArchive.Any())
        {
            _logger.LogInformation($"Found {tasksToArchive.Count} tasks to archive.");
            foreach (var task in tasksToArchive)
            {
                task.IsArchived = true;
            }
            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation($"Successfully archived {tasksToArchive.Count} tasks.");
        }
        else
        {
            _logger.LogInformation("No tasks need archiving today.");
        }

        // 2. Hard Deletion Process (Older than 3 years -> Delete)
        // EF Core 7+ ExecuteDeleteAsync can handle this quickly, but due to ParentTaskId restrict,
        // we load them in memory, or we delete subtasks first.
        var subTasksToDelete = await context.Tasks
            .Where(t => t.ParentTaskId != null &&
                        ((t.ParentTask!.IsCompleted && t.ParentTask.CompletedDate < threeYearsAgo) ||
                         (!t.ParentTask.IsCompleted && t.ParentTask.CreatedDate < threeYearsAgo)))
            .ToListAsync(stoppingToken);
            
        var tasksToDelete = await context.Tasks
            .Where(t => t.ParentTaskId == null &&
                        ((t.IsCompleted && t.CompletedDate < threeYearsAgo) ||
                         (!t.IsCompleted && t.CreatedDate < threeYearsAgo)))
            .ToListAsync(stoppingToken);

        var allTasksToDelete = subTasksToDelete.Concat(tasksToDelete).Distinct().ToList();

        if (allTasksToDelete.Any())
        {
            _logger.LogInformation($"Found {allTasksToDelete.Count} tasks for hard deletion.");
            
            foreach(var task in allTasksToDelete)
            {
                _logger.LogInformation($"[DRY-RUN/LOG] Hard deleting Task ID: {task.Id} - Title: {task.Title}");
            }

            // Delete subtasks first to avoid constraint
            context.Tasks.RemoveRange(subTasksToDelete);
            await context.SaveChangesAsync(stoppingToken);
            
            // Delete parent tasks
            context.Tasks.RemoveRange(tasksToDelete);
            await context.SaveChangesAsync(stoppingToken);
            
            _logger.LogInformation($"Successfully hard deleted {allTasksToDelete.Count} old tasks.");
        }
        else
        {
            _logger.LogInformation("No tasks need hard deletion today.");
        }

        // 3. Snapshot Deletion Process (Older than 1 year -> Delete)
        var oneYearAgo = now.AddYears(-1);
        var snapshotsToDelete = await context.TeamAnalyticsSnapshots
            .Where(s => s.CreatedAt < oneYearAgo)
            .ToListAsync(stoppingToken);

        if (snapshotsToDelete.Any())
        {
            _logger.LogInformation($"Found {snapshotsToDelete.Count} expired team analytics snapshots.");
            context.TeamAnalyticsSnapshots.RemoveRange(snapshotsToDelete);
            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation($"Successfully deleted {snapshotsToDelete.Count} expired team analytics snapshots.");
        }
        else
        {
            _logger.LogInformation("No expired team analytics snapshots found.");
        }
    }
}
