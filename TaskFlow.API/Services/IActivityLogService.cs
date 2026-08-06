public interface IActivityLogService
{
    Task LogAsync(int userId, string action, string description);
}