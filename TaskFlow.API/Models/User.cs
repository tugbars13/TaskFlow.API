namespace TaskFlow.API.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
    
    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedDate { get; set; }

    // Kullanıcının sahip olduğu görevler.
    // ICollection kullanıyoruz çünkü bir kullanıcı birden fazla göreve sahip olabilir.
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    // Kullanıcının rolü (Admin veya User)
    public string Role { get; set; } = "User";
    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    public ICollection<TaskAssignee> TaskAssignees { get; set; } = new List<TaskAssignee>();
}