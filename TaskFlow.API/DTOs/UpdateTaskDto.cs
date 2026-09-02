using System.ComponentModel.DataAnnotations;
using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs;

public class UpdateTaskDto
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(100, ErrorMessage = "Başlık en fazla 100 karakter olabilir.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public TaskFlow.API.Models.TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int CategoryId { get; set; }
    public int? AssignedUserId { get; set; }
    public List<int>? AssigneeIds { get; set; }
}
