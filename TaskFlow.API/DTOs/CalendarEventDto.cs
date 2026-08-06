namespace TaskFlow.API.DTOs;

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Category { get; set; } = "General";
    public string Color { get; set; } = "bg-primary/10 text-primary";
    public bool IsAllDay { get; set; }
}
