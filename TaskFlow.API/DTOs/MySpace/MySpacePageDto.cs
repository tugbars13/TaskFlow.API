namespace TaskFlow.API.DTOs.MySpace
{
    public class MySpacePageDto
    {
        public int Id { get; set; }
        public int? FolderId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

