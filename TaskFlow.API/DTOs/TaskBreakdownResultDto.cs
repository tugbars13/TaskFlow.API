namespace TaskFlow.API.DTOs;

public class TaskBreakdownResultDto
{
    public List<SubtaskSuggestionDto> Subtasks { get; set; } = new();
    public bool HasExistingSubtasks { get; set; }
    public int ExistingSubtaskCount { get; set; }
}

public class SubtaskSuggestionDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
}
