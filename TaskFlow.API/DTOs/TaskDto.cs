using TaskFlow.API.Models;
namespace TaskFlow.API.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public TaskFlow.API.Models.TaskStatus Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskCategory Category { get; set; }
    public int Progress { get; set; }
    public int CommentsCount { get; set; }
    public int AttachmentsCount { get; set; }
    public int? AssignedUserId { get; set; }
    public string? AssignedUserFullName { get; set; }
    public string? AssignedUserAvatar { get; set; }
    public List<AssigneeDto>? Assignees { get; set; } = new List<AssigneeDto>();
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
}