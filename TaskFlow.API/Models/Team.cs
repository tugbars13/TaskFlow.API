namespace TaskFlow.API.Models;

public class Team
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }

    public int CreatedByUserId { get; set; }
    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
}