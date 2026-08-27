namespace TaskFlow.API.DTOs;

public class UpcomingDeadlineDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Medium";
    public string AssignedUser { get; set; } = "Alex M.";
    public string Category { get; set; } = "General";
    public int CategoryId { get; set; }
}
