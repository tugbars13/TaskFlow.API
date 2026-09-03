namespace TaskFlow.API.Models;

public class MySpacePage
{
    public int Id { get; set; }

    public int UserId { get; set; }

    // FolderId nullable: klasöre bağlı olmayan root sayfalar desteklenir.
    public int? FolderId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public MySpaceFolder? Folder { get; set; }
    
    public ICollection<MySpacePageShare> Shares { get; set; } = new List<MySpacePageShare>();
}