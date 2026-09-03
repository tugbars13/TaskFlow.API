namespace TaskFlow.API.DTOs.MySpace
{
    public class CreateMySpaceFolderDto
    {
        public string Name { get; set; } = string.Empty;
        public int? ParentFolderId { get; set; }
    }
}
