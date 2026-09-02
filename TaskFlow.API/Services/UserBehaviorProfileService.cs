using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Utils;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services
{
    public interface IUserBehaviorProfileService
    {
        Task<UserBehaviorProfile> GetOrCalculateProfileAsync(int userId, CancellationToken cancellationToken = default);
        Task InvalidateProfileAsync(int userId, CancellationToken cancellationToken = default);
    }

    public class UserBehaviorProfileService : IUserBehaviorProfileService
    {
        private readonly IUserBehaviorProfileRepository _profileRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserBehaviorProfileService(
            IUserBehaviorProfileRepository profileRepository,
            ITaskRepository taskRepository,
            IUnitOfWork unitOfWork)
        {
            _profileRepository = profileRepository;
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<UserBehaviorProfile> GetOrCalculateProfileAsync(int userId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetProfileAsync(userId, cancellationToken);

            if (profile == null || profile.LastCalculatedAt < DateTime.UtcNow.AddHours(-24))
            {
                return await CalculateAndSaveProfileAsync(userId, profile, cancellationToken);
            }

            return profile;
        }

        public async Task InvalidateProfileAsync(int userId, CancellationToken cancellationToken = default)
        {
            var profile = await _profileRepository.GetProfileAsync(userId, cancellationToken);
            if (profile != null)
            {
                profile.LastCalculatedAt = DateTime.UtcNow.AddDays(-10); // Force recalculation next time
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        private async Task<UserBehaviorProfile> CalculateAndSaveProfileAsync(int userId, UserBehaviorProfile? existingProfile, CancellationToken cancellationToken)
        {
            var tasks = await _taskRepository.GetTasksForUserBehaviorProfileAsync(userId, cancellationToken);

            var metrics = AnalyticsCalculator.CalculateAdvancedMetrics(tasks);

            var profile = existingProfile ?? new UserBehaviorProfile { UserId = userId, CategoryBehaviors = new List<UserCategoryBehavior>() };

            profile.TotalTasks = tasks.Count;
            profile.CompletedTasks = tasks.Count(t => t.IsCompleted);
            profile.LateTasks = metrics.CategoryPerformances?.Sum(c => c.LateTasks) ?? 0;
            profile.ProcrastinatedTasks = metrics.CategoryPerformances?.Sum(c => c.ProcrastinatedTasks) ?? 0;
            profile.OnTimeCompletionRate = metrics.OnTimeCompletionRate;
            profile.AverageCompletionDays = metrics.OverallAverageCompletionDays ?? 0;
            profile.CurrentOverdueTasks = metrics.ActiveOverdueTasks;
            profile.LastCalculatedAt = DateTime.UtcNow;

            if (metrics.CategoryPerformances != null)
            {
                foreach (var catPerf in metrics.CategoryPerformances)
                {
                    if (!catPerf.CategoryId.HasValue)
                        continue;

                    var categoryId = catPerf.CategoryId.Value;

                    var catBehavior = profile.CategoryBehaviors
                        .FirstOrDefault(c => c.CategoryId == categoryId);

                    if (catBehavior == null)
                    {
                        catBehavior = new UserCategoryBehavior
                        {
                            CategoryId = categoryId
                        };

                        profile.CategoryBehaviors.Add(catBehavior);
                    }

                    catBehavior.TotalTasks = catPerf.TotalTasks;
                    catBehavior.CompletedTasks = catPerf.CompletedTasks;
                    catBehavior.LateTasks = catPerf.LateTasks;
                    catBehavior.ProcrastinatedTasks = catPerf.ProcrastinatedTasks;

                    if (catPerf.CompletedTasks > 0)
                    {
                        var onTime = catPerf.CompletedTasks - catPerf.LateTasks;
                        catBehavior.OnTimeCompletionRate = (onTime / (double)catPerf.CompletedTasks) * 100;
                    }
                    else
                    {
                        catBehavior.OnTimeCompletionRate = 0;
                    }

                    var lateRate = catPerf.TotalTasks > 0 ? (double)catPerf.LateTasks / catPerf.TotalTasks : 0;
                    var procRate = catPerf.TotalTasks > 0 ? (double)catPerf.ProcrastinatedTasks / catPerf.TotalTasks : 0;

                    if (lateRate > 0.3 || procRate > 0.3 || catPerf.LateTasks > 1 || catPerf.ProcrastinatedTasks > 1)
                        catBehavior.RiskLevel = "YÜKSEK";
                    else if (lateRate > 0.1 || procRate > 0.1 || catPerf.LateTasks > 0 || catPerf.ProcrastinatedTasks > 0)
                        catBehavior.RiskLevel = "ORTA";
                    else
                        catBehavior.RiskLevel = "DÜŞÜK";

                    catBehavior.LastCalculatedAt = DateTime.UtcNow;
                }
            }

            if (existingProfile == null)
            {
                await _profileRepository.AddProfileAsync(profile, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            else
            {
                await _profileRepository.UpdateProfileAsync(profile, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return profile;
        }
    }
}
