using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<UserDto?> GetCurrentUserAsync(int userId);

}