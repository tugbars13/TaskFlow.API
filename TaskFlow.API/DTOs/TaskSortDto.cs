namespace TaskFlow.API.DTOs;

public class TaskSortDto : PaginationDto
{
    // title, createdDate, dueDate, priority
    public string SortBy { get; set; } = "createdDate";

    // asc veya desc
    public string Direction { get; set; } = "desc";
    public bool IsDescending => Direction.ToLower() == "desc";
}