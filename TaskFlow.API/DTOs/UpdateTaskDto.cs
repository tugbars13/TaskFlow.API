using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public TaskFlow.API.Models.TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskCategory Category { get; set; }
    public int? AssignedUserId { get; set; }
    public List<int>? AssigneeIds { get; set; }
}