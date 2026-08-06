namespace TaskFlow.API.DTOs;

public class PaginationDto
{
    // Kaçıncı sayfa
    public int PageNumber { get; set; } = 1;

    // Sayfa başına kayıt
    public int PageSize { get; set; } = 10;
}