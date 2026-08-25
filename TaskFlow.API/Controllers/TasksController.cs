//using : ASP.NET Corun sontroller sÄ±nÄ±flarÄ±nÄ± kullanabilmek iÃ§in yazarÄ±z
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskStatus = TaskFlow.API.Models.TaskStatus;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController] // bu sÄ±nÄ±f bir web API ControllerÄ±dÄ±r
    [Route("api/[controller]")] //url oluÅŸturur
    [Authorize] // Bu controller'daki tÃ¼m endpoint'ler artÄ±k JWT ister.
    public class TasksController : ControllerBase //inheritance ile ControllerBase sÄ±nÄ±fÄ±ndan tÃ¼retilir
    {
        private readonly ITaskService _taskService;
        private readonly ITeamAuthorizationService _teamAuth;
        private readonly IAiService _aiService;

        public TasksController(ITaskService taskService, ITeamAuthorizationService teamAuth, IAiService aiService)
        {
            _taskService = taskService;
            _teamAuth = teamAuth;
            _aiService = aiService;
        }

        private TaskDto MapToDto(TaskItem task)
        {
            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description ?? string.Empty,
                IsCompleted = task.IsCompleted,
                Status = task.Status == 0 ? (task.IsCompleted ? TaskStatus.Completed : TaskStatus.Backlog) : task.Status,
                CreatedDate = task.CreatedDate,
                Priority = task.Priority,
                DueDate = task.DueDate,
                Category = task.Category,
                Progress = task.IsCompleted ? 100 : (task.Status == TaskStatus.InProgress ? 75 : task.Status == TaskStatus.ToDo ? 25 : 0),
                CommentsCount = 2,
                AttachmentsCount = 1,
                AssignedUserId = task.Assignees?.FirstOrDefault()?.UserId,
                AssignedUserFullName = task.Assignees?.FirstOrDefault()?.User?.FullName,
                AssignedUserAvatar = task.Assignees?.FirstOrDefault()?.User?.AvatarUrl,
                Assignees = task.Assignees?.Select(a => new AssigneeDto 
                { 
                    Id = a.UserId, 
                    FullName = a.User?.FullName ?? string.Empty, 
                    AvatarUrl = a.User?.AvatarUrl 
                }).ToList() ?? new List<AssigneeDto>(),
                TeamId = task.TeamId,
                TeamName = task.Team?.Name,
                ParentTaskId = task.ParentTaskId
            };
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userId!);
        }

        // Sadece Admin kullanÄ±cÄ±larÄ± tÃ¼m gÃ¶revleri gÃ¶rebilir.
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _taskService.GetAllTasksForAdminAsync();

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "TÃ¼m gÃ¶revler getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetTasks([FromQuery] TaskFilterDto filter)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetAllByUserIdAsync(userId, filter);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "GÃ¶revler baÅŸarÄ±yla getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }
        
        // GET: api/teams/{teamId}/tasks
        [HttpGet("~/api/teams/{teamId}/tasks")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetTeamTasks(int teamId, [FromQuery] TaskFilterDto filter)
        {
            var userId = GetCurrentUserId();

            // Validate user belongs to the team
            var isAuthorized = await _teamAuth.IsTeamMemberOrCreatorAsync(teamId, userId);
            if (!isAuthorized)
            {
                return Forbid();
            }

            var tasks = await _taskService.GetByTeamIdAsync(teamId, filter, userId);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "TakÄ±m gÃ¶revleri baÅŸarÄ±yla getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> GetTask(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var task = await _taskService.GetByIdAsync(id);

            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "GÃ¶rev bulunamadÄ±."
                });
            }

            return Ok(new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "GÃ¶rev bulundu.",
                Data = MapToDto(task)
            });
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.CreateTaskAsync(userId, dto, isAdmin);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "Görev başarıyla oluşturuldu.",
                Data = MapToDto(task)
            });
        }
        // GET: api/tasks/ai-order
        [HttpGet("ai-order")]
        public async Task<ActionResult<ApiResponse<List<AiTaskOrderDto>>>> GenerateTaskOrder()
        {
            var userId = GetCurrentUserId();
                var tasks = await _taskService.GetAllByUserIdAsync(userId);
                
                var activeTasks = tasks.Where(t => !t.IsCompleted && !t.IsDeleted).ToList();
                if (!activeTasks.Any())
                {
                    return Ok(new ApiResponse<List<AiTaskOrderDto>>
                    {
                        Success = true,
                        Message = "SÄ±ralanacak aktif gÃ¶rev bulunmuyor.",
                        Data = new List<AiTaskOrderDto>()
                    });
                }
                
                var profileService = HttpContext.RequestServices.GetRequiredService<TaskFlow.API.Services.IUserBehaviorProfileService>();
                var profile = await profileService.GetOrCalculateProfileAsync(userId);
                
                var aiResultTasks = await _aiService.GenerateTaskOrderAsync(tasks, profile);
                var finalOrderedTasks = new List<AiTaskOrderDto>();
                var validTaskIds = new HashSet<int>(activeTasks.Select(t => t.Id));
                var processedTaskIds = new HashSet<int>();

                // 3. Calculate Organic Backend Score
                int currentScore = 95 + (activeTasks.Count % 4);

                // 1. Map AI results to real task data
                foreach (var aiItem in aiResultTasks.OrderBy(x => x.Rank))
                {
                    // Ignore fake IDs or duplicates
                    if (!validTaskIds.Contains(aiItem.TaskId) || processedTaskIds.Contains(aiItem.TaskId))
                        continue;

                    var realTask = activeTasks.First(t => t.Id == aiItem.TaskId);
                    
                    int drop = 7; // Base drop
                    
                    if (realTask.Priority == TaskFlow.API.Models.TaskPriority.High) drop -= 3;
                    else if (realTask.Priority == TaskFlow.API.Models.TaskPriority.Low) drop += 2;
                    
                    if (realTask.DueDate.HasValue)
                    {
                        var days = (realTask.DueDate.Value - DateTime.UtcNow).TotalDays;
                        if (days < 0) drop -= 3;
                        else if (days < 2) drop -= 2;
                        else if (days > 7) drop += 3;
                    }
                    
                    if (realTask.Status == TaskFlow.API.Models.TaskStatus.InProgress) drop -= 1;
                    
                    if (profile.CategoryBehaviors != null)
                    {
                        var catPerf = profile.CategoryBehaviors.FirstOrDefault(c => c.Category == realTask.Category);
                        if (catPerf != null && (catPerf.LateTasks > 0 || catPerf.ProcrastinatedTasks > 0))
                        {
                             drop -= 2; // User risk category
                        }
                    }
                    
                    if (drop < 1) drop = 1 + (realTask.Id % 2);
                    if (drop > 15) drop = 14 + (realTask.Id % 2);
                    
                    if (finalOrderedTasks.Count == 0)
                    {
                        currentScore -= (drop / 2);
                        if (currentScore > 99) currentScore = 99;
                    }
                    else
                    {
                        currentScore -= drop;
                    }
                    if (currentScore < 15) currentScore = 15;

                    var dto = new AiTaskOrderDto
                    {
                        TaskId = realTask.Id,
                        Title = realTask.Title,
                        Priority = realTask.Priority.ToString(),
                        DueDate = realTask.DueDate?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        Status = realTask.Status.ToString(),
                        Category = realTask.Category.ToString(),
                        Rank = aiItem.Rank,
                        Score = currentScore,
                        Reasoning = aiItem.Reasoning
                    };
                    
                    finalOrderedTasks.Add(dto);
                    processedTaskIds.Add(realTask.Id);
                }

                // 2. Append missing active tasks that AI forgot
                var missingTasks = activeTasks.Where(t => !processedTaskIds.Contains(t.Id)).ToList();
                if (missingTasks.Any())
                {
                    int nextRank = finalOrderedTasks.Any() ? finalOrderedTasks.Max(x => x.Rank) + 1 : 1;
                    foreach (var missingTask in missingTasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ThenByDescending(t => t.Priority))
                    {
                        currentScore -= 8;
                        if (currentScore < 5) currentScore = 5;

                        finalOrderedTasks.Add(new AiTaskOrderDto
                        {
                            TaskId = missingTask.Id,
                            Title = missingTask.Title,
                            Priority = missingTask.Priority.ToString(),
                            DueDate = missingTask.DueDate?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                            Status = missingTask.Status.ToString(),
                            Category = missingTask.Category.ToString(),
                            Rank = nextRank++,
                            Score = currentScore,
                            Reasoning = "AI deÄŸerlendirmesine girmediÄŸi iÃ§in standart Ã¶nceliÄŸe gÃ¶re sÄ±ralandÄ±."
                        });
                    }
                }
                
                // Re-sort final list by rank
                finalOrderedTasks = finalOrderedTasks.OrderBy(x => x.Rank).ToList();
                
                return Ok(new ApiResponse<List<AiTaskOrderDto>>
                {
                    Success = true,
                    Message = "AI Task Order generated successfully.",
                    Data = finalOrderedTasks
                });
            }
        // POST: api/tasks/{id}/breakdown
        [HttpPost("{id}/breakdown")]
        public async Task<ActionResult<ApiResponse<TaskBreakdownResultDto>>> GenerateBreakdown(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.GetByIdAsync(id);
            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
            {
                return NotFound(new ApiResponse<TaskBreakdownResultDto>
                {
                    Success = false,
                    Message = "Görev bulunamadı veya yetkiniz yok."
                });
            }

            var result = await _aiService.GenerateTaskBreakdownAsync(task!);

            var existingSubtasksCount = await _taskService.GetSubtaskCountAsync(id);

            result.ExistingSubtaskCount = existingSubtasksCount;
            result.HasExistingSubtasks = existingSubtasksCount > 0;

            return Ok(new ApiResponse<TaskBreakdownResultDto>
            {
                Success = true,
                Message = "Alt görev önerileri başarıyla oluşturuldu.",
                Data = result
            });
        }
        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var updated = await _taskService.UpdateTaskAsync(id, userId, dto, isAdmin);
            if (!updated) return NotFound();
            return NoContent();
        }
        // PUT: api/tasks/5/toggle
        [HttpPut("{id}/toggle")]
                public async Task<IActionResult> ToggleTask(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var newStatus = await _taskService.ToggleTaskAsync(id, userId, isAdmin);
            if (newStatus == null) return NotFound();

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Message = "Görev tamamlanma durumu güncellendi.",
                Data = newStatus.Value
            });
        }
        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.GetByIdAsync(id);
            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
                return NotFound();

            var deleted = await _taskService.DeleteAsync(id, userId);
            if (!deleted)
                return NotFound();

            return NoContent();
        }


        [Authorize]
        [HttpGet("filter")]
        public async Task<IActionResult> FilterTasks([FromQuery] TaskFilterDto filter)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.FilterAsync(userId, filter);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "FiltrelenmiÅŸ gÃ¶revler getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchTasks(string keyword)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.SearchAsync(userId, keyword);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Arama sonuÃ§larÄ± getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }

        [Authorize]
        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedTasks([FromQuery] PaginationDto pagination)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetPagedAsync(userId, pagination);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "GÃ¶revler sayfalÄ± getirildi.",
                Data = tasks.Select(MapToDto)
            });
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = GetCurrentUserId();
            var dashboard = await _taskService.GetDashboardAsync(userId);

            return Ok(new ApiResponse<DashboardDto>
            {
                Success = true,
                Message = "Dashboard bilgileri getirildi.",
                Data = dashboard
            });
        }

        [Authorize]
        [HttpGet("sort")]
        public async Task<IActionResult> SortTasks([FromQuery] TaskSortDto sort)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.SortAsync(userId, sort);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "GÃ¶revler sÄ±ralandÄ±.",
                Data = tasks.Select(MapToDto)
            });
        }
    }
}

