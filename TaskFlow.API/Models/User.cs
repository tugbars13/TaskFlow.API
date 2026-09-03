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

    // KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â±nÃƒâ€Ã‚Â±n sahip olduÃƒâ€Ã…Â¸u gÃƒÆ’Ã‚Â¶revler.
    // ICollection kullanÃƒâ€Ã‚Â±yoruz ÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â¼nkÃƒÆ’Ã‚Â¼ bir kullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â± birden fazla gÃƒÆ’Ã‚Â¶reve sahip olabilir.
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // KullanÃƒâ€Ã‚Â±cÃƒâ€Ã‚Â±nÃƒâ€Ã‚Â±n rolÃƒÆ’Ã‚Â¼ (Admin veya User)
    public string Role { get; set; } = "User";

    // Ãƒâ€¦Ã‚Âifre sÃƒâ€Ã‚Â±fÃƒâ€Ã‚Â±rlama iÃƒÆ’Ã‚Â§in gereken token ve geÃƒÆ’Ã‚Â§erlilik sÃƒÆ’Ã‚Â¼resi
    public string? ResetPasswordToken { get; set; }

    public DateTime? ResetPasswordTokenExpiry { get; set; }

    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    public ICollection<TaskAssignee> TaskAssignees { get; set; } = new List<TaskAssignee>();

    public NotificationPreference? NotificationPreference { get; set; }
}