namespace TaskFlow.API.DTOs;

public class TaskDto
{
    // Görevin benzersiz kimliği.
    public int Id { get; set; }

    // Görev başlığı.
    public string Title { get; set; } = string.Empty;

    // Görev açıklaması.
    public string Description { get; set; } = string.Empty;

    // Tamamlanma bilgisi.
    public bool IsCompleted { get; set; }

    // Oluşturulma tarihi.
    public DateTime CreatedDate { get; set; }
}