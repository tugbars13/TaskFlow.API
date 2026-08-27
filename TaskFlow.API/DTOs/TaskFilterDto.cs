using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs;

public class TaskFilterDto
{
    public string? Keyword { get; set; }
    public TaskPriority? Priority { get; set; }
    public int? CategoryId { get; set; }
    public TaskFlow.API.Models.TaskStatus? Status { get; set; }
    public bool? IsCompleted { get; set; }
    public string? AssigneeId { get; set; } // Can be "Me", "Unassigned", or a numeric ID string
    public string? DueDateRange { get; set; } // "Overdue", "Today", "ThisWeek", "NoDueDate"
}
