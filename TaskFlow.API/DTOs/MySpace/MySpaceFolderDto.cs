namespace TaskFlow.API.DTOs.MySpace
{
    public class MySpaceFolderDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? ParentFolderId { get; set; }
    }
}
