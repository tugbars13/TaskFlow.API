using System.Collections.Generic;

namespace TaskFlow.API.DTOs
{
    public class AiTaskOrderDto
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? DueDate { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }

    public class AiTaskOrderResultDto
    {
        public List<AiTaskOrderDto> OrderedTasks { get; set; } = new();
    }
}
