// Services/IUserService.cs
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
}