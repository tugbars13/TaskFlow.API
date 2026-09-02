//using : ASP.NET Corun sontroller sınıflarını kullanabilmek için yazarız
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
    [ApiController] // bu sınıf bir web API Controllerıdır
    [Route("api/[controller]")] //url oluşturur
    [Authorize] // Bu controller'daki tüm endpoint'ler artık JWT ister.
    public class TasksController : ControllerBase //inheritance ile ControllerBase sınıfından türetilir
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

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userId!);
        }

        // Sadece Admin kullanıcıları tüm görevleri görebilir.
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTasks(CancellationToken cancellationToken)
        {
            var tasks = await _taskService.GetAllTasksForAdminAsync(cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Tüm görevler getirildi.",
                Data = tasks
            });
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetTasks([FromQuery] TaskFilterDto filter, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetAllByUserIdAsync(userId, filter, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Görevler başarıyla getirildi.",
                Data = tasks
            });
        }

        // GET: api/teams/{teamId}/tasks
        [HttpGet("~/api/teams/{teamId}/tasks")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetTeamTasks(int teamId, [FromQuery] TaskFilterDto filter, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();

            // Validate user belongs to the team
            var isAuthorized = await _teamAuth.IsTeamMemberOrCreatorAsync(teamId, userId);
            if (!isAuthorized)
            {
                return Forbid();
            }

            var tasks = await _taskService.GetByTeamIdAsync(teamId, filter, userId, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Takım görevleri başarıyla getirildi.",
                Data = tasks
            });
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> GetTask(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var taskEntity = await _taskService.GetEntityByIdAsync(id, cancellationToken);

            if (taskEntity == null || !await _teamAuth.CanManageTaskAsync(taskEntity, userId, isAdmin))
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Görev bulunamadı."
                });
            }

            var task = await _taskService.GetByIdAsync(id, cancellationToken);

            return Ok(new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "Görev bulundu.",
                Data = task
            });
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.CreateTaskAsync(userId, dto, isAdmin, cancellationToken);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "Görev başarıyla oluşturuldu.",
                Data = task
            });
        }
        // GET: api/tasks/ai-order
        [HttpGet("ai-order")]
        public async Task<ActionResult<ApiResponse<List<AiTaskOrderDto>>>> GenerateTaskOrder(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var finalOrderedTasks = await _taskService.GenerateTaskOrderAsync(userId, cancellationToken);

            return Ok(new ApiResponse<List<AiTaskOrderDto>>
            {
                Success = true,
                Message = "AI Task Order generated successfully.",
                Data = finalOrderedTasks
            });
        }
        // POST: api/tasks/{id}/breakdown
        [HttpPost("{id}/breakdown")]
        public async Task<ActionResult<ApiResponse<TaskBreakdownResultDto>>> GenerateBreakdown(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.GetEntityByIdAsync(id, cancellationToken);
            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
            {
                return NotFound(new ApiResponse<TaskBreakdownResultDto>
                {
                    Success = false,
                    Message = "Görev bulunamadı veya yetkiniz yok."
                });
            }

            var result = await _aiService.GenerateTaskBreakdownAsync(task!, cancellationToken);

            var existingSubtasksCount = await _taskService.GetSubtaskCountAsync(id, cancellationToken);

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
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var updated = await _taskService.UpdateTaskAsync(id, userId, dto, isAdmin, cancellationToken);
            if (updated == null) return NotFound();
            return Ok(new ApiResponse<TaskDto> { Success = true, Message = "Görev güncellendi.", Data = updated });
        }
        // PUT: api/tasks/5/toggle
        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleTask(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var newStatus = await _taskService.ToggleTaskAsync(id, userId, isAdmin, cancellationToken);
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
        public async Task<IActionResult> DeleteTask(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var task = await _taskService.GetEntityByIdAsync(id, cancellationToken);
            if (task == null || !await _teamAuth.CanManageTaskAsync(task, userId, isAdmin))
                return NotFound();

            var deleted = await _taskService.DeleteTaskAsync(id, userId, isAdmin, cancellationToken);
            if (!deleted)
                return NotFound();

            return NoContent();
        }


        [Authorize]
        [HttpGet("filter")]
        public async Task<IActionResult> FilterTasks([FromQuery] TaskFilterDto filter, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.FilterAsync(userId, filter, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Filtrelenmiş görevler getirildi.",
                Data = tasks
            });
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchTasks(string keyword, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.SearchAsync(userId, keyword, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Arama sonuçları getirildi.",
                Data = tasks
            });
        }

        [Authorize]
        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedTasks([FromQuery] PaginationDto pagination, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetPagedAsync(userId, pagination, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Görevler sayfalı getirildi.",
                Data = tasks
            });
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var dashboard = await _taskService.GetDashboardAsync(userId, cancellationToken);

            return Ok(new ApiResponse<DashboardDto>
            {
                Success = true,
                Message = "Dashboard bilgileri getirildi.",
                Data = dashboard
            });
        }

        [Authorize]
        [HttpGet("sort")]
        public async Task<IActionResult> SortTasks([FromQuery] TaskSortDto sort, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.SortAsync(userId, sort, cancellationToken);

            return Ok(new ApiResponse<IEnumerable<TaskDto>>
            {
                Success = true,
                Message = "Görevler sıralandı.",
                Data = tasks
            });
        }
    }
}
