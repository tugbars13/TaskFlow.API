using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs.MySpace;

public class UpdateSharedPageDto
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(200, ErrorMessage = "Başlık 200 karakteri geçemez.")]
    public string Title { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
}
