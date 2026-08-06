using System.ComponentModel.DataAnnotations;
using TaskFlow.API.Models;
namespace TaskFlow.API.DTOs;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(100, ErrorMessage = "Başlık en fazla 100 karakter olabilir.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskCategory Category { get; set; }
    public int? AssignedUserId { get; set; }
    public int? TeamId { get; set; }
}