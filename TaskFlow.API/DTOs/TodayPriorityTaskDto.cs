namespace TaskFlow.API.DTOs;

public class TodayPriorityTaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public int Progress { get; set; }
    public int CommentsCount { get; set; }
    public int AttachmentsCount { get; set; }
    public bool IsCompleted { get; set; }
    public string? CompletedText { get; set; }
}
