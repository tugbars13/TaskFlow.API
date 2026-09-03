namespace TaskFlow.API.DTOs.MySpace;

public class SharedPageDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string Permission { get; set; } = string.Empty;
}
