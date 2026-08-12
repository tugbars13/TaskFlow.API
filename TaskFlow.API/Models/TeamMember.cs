namespace TaskFlow.API.Models;

public class TeamMember
{
    public int Id { get; set; }

    public int TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public TeamRole Role { get; set; }

    public TeamMemberStatus Status { get; set; } = TeamMemberStatus.Accepted;

    public DateTime JoinedDate { get; set; }
}