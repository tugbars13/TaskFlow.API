namespace TaskFlow.API.DTOs;

public class UpdateTaskDto
{
    // Güncellenecek görev başlığı.
    public string Title { get; set; } = string.Empty;

    // Güncellenecek açıklama.
    public string Description { get; set; } = string.Empty;

    // Tamamlanma durumu.
    public bool IsCompleted { get; set; }
}