namespace TaskFlow.API.DTOs.Team
{
    public class UpdateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}