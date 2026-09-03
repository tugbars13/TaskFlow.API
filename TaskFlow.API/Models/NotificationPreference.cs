namespace TaskFlow.API.Models;

public class NotificationPreference
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public bool EmailEnabled { get; set; } = true;
    public bool PushEnabled { get; set; } = true;

    // Allowed values: "Email & Push", "Email Only", "Push Only", "None"
    public string TaskAssignments { get; set; } = "Email & Push";
    public string DueDateReminders { get; set; } = "Email & Push";
    public string SystemUpdates { get; set; } = "Email Only";
}
