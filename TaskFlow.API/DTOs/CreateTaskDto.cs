using System.ComponentModel.DataAnnotations; // Validation attribute'ları için gerekli

namespace TaskFlow.API.DTOs;

public class CreateTaskDto
{
    // Kullanıcı başlık göndermek zorunda.
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(100, ErrorMessage = "Başlık en fazla 100 karakter olabilir.")]
    public string Title { get; set; } = string.Empty;

    // Açıklama zorunlu değil.
    [MaxLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;
}