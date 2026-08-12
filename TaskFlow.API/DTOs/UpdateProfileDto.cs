namespace TaskFlow.API.DTOs;

public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
}
