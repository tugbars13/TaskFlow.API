namespace TaskFlow.API.Models;

public class MySpaceFolder
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? ParentFolderId { get; set; }

    public MySpaceFolder? ParentFolder { get; set; }

    public ICollection<MySpaceFolder> Children { get; set; } = new List<MySpaceFolder>();

    public ICollection<MySpacePage> Pages { get; set; } = new List<MySpacePage>();
}