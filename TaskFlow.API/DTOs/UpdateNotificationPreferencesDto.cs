namespace TaskFlow.API.DTOs;

public class UpdateNotificationPreferencesDto
{
    public bool EmailEnabled { get; set; }
    public bool PushEnabled { get; set; }
    public string TaskAssignments { get; set; } = string.Empty;
    public string DueDateReminders { get; set; } = string.Empty;
    public string SystemUpdates { get; set; } = string.Empty;
}
