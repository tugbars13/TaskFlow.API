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

        public int Rank { get; set; }
        public int Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class AiTaskOrderResultDto
    {
        public List<AiTaskOrderResponseItemDto> Tasks { get; set; } = new();
    }

    public class AiTaskOrderResponseItemDto
    {
        public int TaskId { get; set; }
        public int Rank { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }
}
