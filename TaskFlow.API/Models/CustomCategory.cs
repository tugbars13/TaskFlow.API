namespace TaskFlow.API.Models;

public class CustomCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? UserId { get; set; }

    // Navigation property
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
