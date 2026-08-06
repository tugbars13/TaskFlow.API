using TaskFlow.API.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskCategory Category { get; set; }
    public TaskFlow.API.Models.TaskStatus Status { get; set; }
    = TaskFlow.API.Models.TaskStatus.Backlog;

    public DateTime? DueDate { get; set; }
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }
    public DateTime? CompletedDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }

    public int? TeamId { get; set; }
    public Team? Team { get; set; }

    public bool IsDeleted { get; set; } = false;
}