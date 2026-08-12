namespace TaskFlow.API.DTOs;

public class AssigneeDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
