using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs;

public class TaskFilterDto
{
    // Öncelik filtresi
    public TaskPriority? Priority { get; set; }

    // Kategori filtresi
    public TaskCategory? Category { get; set; }

    // Tamamlandı mı?
    public bool? IsCompleted { get; set; }
}