using System;

namespace TaskFlow.API.Repositories.Results;

public class TaskDateProjectionResult
{
    public DateTime CreatedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? CategoryId { get; set; }
}
