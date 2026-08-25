namespace TaskFlow.API.DTOs.MySpace
{
    public class UpdateMySpacePageDto
    {
        public int? FolderId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
    }
}

