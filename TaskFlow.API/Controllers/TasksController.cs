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
        private readonly TaskFlow.API.Data.AppDbContext _context;
        private readonly IAiService _aiService;

        public TasksController(ITaskService taskService, ITeamAuthorizationService teamAuth, TaskFlow.API.Data.AppDbContext context, IAiService aiService)
        {
            _taskService = taskService;
            _teamAuth = teamAuth;
            _context = context;
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
                AssignedUserId = task.AssignedUserId,
                AssignedUserFullName = task.AssignedUser?.FullName,
                AssignedUserAvatar = task.AssignedUser?.AvatarUrl,
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

            Console.WriteLine($"[DIAGNOSTIC] CreateTask POST request received.");
            Console.WriteLine($"[DIAGNOSTIC] currentUserId: {userId}");
            Console.WriteLine($"[DIAGNOSTIC] teamId: {dto.TeamId}");
            Console.WriteLine($"[DIAGNOSTIC] assignedUserId: {dto.AssignedUserId}");
            Console.WriteLine($"[DIAGNOSTIC] assigneeIds: {(dto.AssigneeIds != null ? string.Join(",", dto.AssigneeIds) : "null")}");


            if (dto.TeamId.HasValue)
            {
                var canCreate = await _teamAuth.CanCreateTaskForTeamAsync(dto.TeamId.Value, userId);
                Console.WriteLine($"[DIAGNOSTIC] CanCreateTaskForTeamAsync result: {canCreate}");
                if (!canCreate)
                {
                    Console.WriteLine($"[DIAGNOSTIC] Returning 403 Forbid from CanCreateTaskForTeamAsync check.");
                    return Forbid();
                }
            }

            var assignees = new List<TaskAssignee>();

            if (dto.AssigneeIds != null && dto.AssigneeIds.Any())
            {
                if (!dto.TeamId.HasValue)
                {
                    Console.WriteLine($"[DIAGNOSTIC] Returning 400 BadRequest: Missing TeamId for assignees.");
                    return BadRequest(new ApiResponse<TaskDto> { Success = false, Message = "KullanÄ±cÄ± atamak iÃ§in takÄ±m belirtmelisiniz." });
                }

                foreach (var assigneeId in dto.AssigneeIds)
                {
                    var isMember = _context.TeamMembers.Any(tm => tm.TeamId == dto.TeamId.Value && tm.UserId == assigneeId && tm.Status == TeamMemberStatus.Accepted);
                    if (!isMember)
                    {
                        return BadRequest(new ApiResponse<TaskDto> { Success = false, Message = $"GeÃ§ersiz kullanÄ±cÄ± atamasÄ±: {assigneeId}" });
                    }
                    
                    assignees.Add(new TaskAssignee { UserId = assigneeId });
                }
            }

            if (dto.ParentTaskId.HasValue)
            {
                var parentTask = await _taskService.GetByIdAsync(dto.ParentTaskId.Value);
                var isAdmin = User.IsInRole("Admin");
                if (parentTask == null || !await _teamAuth.CanManageTaskAsync(parentTask, userId, isAdmin))
                {
                    return BadRequest(new ApiResponse<TaskDto> { Success = false, Message = "GeÃ§ersiz veya yetkisiz Parent Task." });
                }
            }

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                Category = dto.Category,
                AssignedUserId = dto.AssignedUserId,
                TeamId = dto.TeamId,
                UserId = userId,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false,
                Assignees = assignees,
                ParentTaskId = dto.ParentTaskId
            };

            var createdTask = await _taskService.CreateAsync(task);
            var taskDto = MapToDto(createdTask);

            return CreatedAtAction(nameof(GetTask),
                new { id = createdTask.Id },
                new ApiResponse<TaskDto>
                {
                    Success = true,
                    Message = "GÃ¶rev baÅŸarÄ±yla oluÅŸturuldu.",
                    Data = taskDto
                });
        }

        // GET: api/tasks/ai-order
        [HttpGet("ai-order")]
        public async Task<ActionResult<ApiResponse<List<AiTaskOrderDto>>>> GenerateTaskOrder()
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<AiTaskOrderDto>>
                {
                    Success = false,
                    Message = $"Error generating AI Task Order: {ex.Message}"
                });
            }
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
                    Message = "GÃ¶rev bulunamadÄ± veya yetkiniz yok."
                });
            }

            try
            {
                var result = await _aiService.GenerateTaskBreakdownAsync(task);
                
                // Existing subtasks check
                var existingSubtasksCount = await _context.Tasks.CountAsync(t => t.ParentTaskId == id && !t.IsDeleted);
                
                result.ExistingSubtaskCount = existingSubtasksCount;
                result.HasExistingSubtasks = existingSubtasksCount > 0;

                return Ok(new ApiResponse<TaskBreakdownResultDto>
                {
                    Success = true,
                    Message = "Alt gÃ¶rev Ã¶nerileri baÅŸarÄ±yla oluÅŸturuldu.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                // Return 502 Bad Gateway for external AI API errors, or 500
                return StatusCode(502, new ApiResponse<TaskBreakdownResultDto>
                {
                    Success = false,
                    Message = "Bu gÃ¶rev iÃ§in ÅŸu anda AI alt gÃ¶rev Ã¶nerileri oluÅŸturulamadÄ±."
                });
            }
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            // 1. Find the task and check authorization
            var task = await _taskService.GetByIdAsync(id);

            Console.WriteLine($"[DEBUG-TRACE] PUT /api/tasks/{id} started.");
            Console.WriteLine($"[DEBUG-TRACE] current userId: {userId}, isAdmin: {isAdmin}");
            Console.WriteLine($"[DEBUG-TRACE] task found? {(task != null)}");

            if (task != null)
            {
                Console.WriteLine($"[DEBUG-TRACE] task.Id: {task.Id}, task.TeamId: {task.TeamId}, task.UserId: {task.UserId}, task.AssignedUserId: {task.AssignedUserId}");
                var canManage = await _teamAuth.CanManageTaskAsync(task, userId, isAdmin);
                Console.WriteLine($"[DEBUG-TRACE] CanManageTaskAsync returned: {canManage}");
            }

            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
            {
                Console.WriteLine($"[DEBUG-TRACE] Returning NotFound (1st check). task == null: {task == null}");
                return NotFound();
            }
            
            List<TaskAssignee>? assignees = null;

            if (dto.AssigneeIds != null)
            {
                assignees = new List<TaskAssignee>();
                if (task.TeamId.HasValue)
                {
                    // Temizle ve yeniden oluÅŸtur (tam liste deÄŸiÅŸtirme mantÄ±ÄŸÄ±)
                    var distinctIds = dto.AssigneeIds.Distinct();
                    foreach (var assigneeId in distinctIds)
                    {
                        var isMember = _context.TeamMembers.Any(tm => tm.TeamId == task.TeamId.Value && tm.UserId == assigneeId && tm.Status == TeamMemberStatus.Accepted);
                        if (!isMember)
                        {
                            return BadRequest(new ApiResponse<TaskDto> { Success = false, Message = $"GeÃ§ersiz kullanÄ±cÄ± atamasÄ±: {assigneeId}" });
                        }
                        
                        assignees.Add(new TaskAssignee { TaskId = id, UserId = assigneeId });
                    }
                }
                else if (dto.AssigneeIds.Any())
                {
                    return BadRequest(new ApiResponse<TaskDto> { Success = false, Message = "KullanÄ±cÄ± atamak iÃ§in takÄ±m belirtmelisiniz." });
                }
            }

            var updatedTask = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = dto.Status == TaskStatus.Completed || dto.IsCompleted,
                Status = dto.Status != 0 ? dto.Status : (dto.IsCompleted ? TaskStatus.Completed : TaskStatus.Backlog),
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                Category = dto.Category,
                AssignedUserId = dto.AssignedUserId,
                Assignees = assignees!
            };

            Console.WriteLine($"[DEBUG-TRACE] Calling TaskService.UpdateAsync");
            var updated = await _taskService.UpdateAsync(id, userId, updatedTask);
            Console.WriteLine($"[DEBUG-TRACE] TaskService.UpdateAsync returned: {updated}");

            if (!updated)
            {
                Console.WriteLine($"[DEBUG-TRACE] Returning NotFound (2nd check). updated is false.");
                return NotFound();
            }

            return NoContent();
        }

        // PUT: api/tasks/5/toggle
        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleTask(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.GetByIdAsync(id);
            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
                return NotFound();

            task.IsCompleted = !task.IsCompleted;
            var updated = await _taskService.UpdateAsync(id, userId, task);

            if (!updated)
                return NotFound();

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Message = "GÃ¶rev tamamlanma durumu gÃ¼ncellendi.",
                Data = task.IsCompleted
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



