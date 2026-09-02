using System;
using System.Collections.Generic;

namespace TaskFlow.API.Repositories.Results;

public class TeamOverdueTaskResult
{
    public int TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public List<string> Assignees { get; set; } = new();
}
