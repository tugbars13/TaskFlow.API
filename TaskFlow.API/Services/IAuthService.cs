using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<UserDto?> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAccountAsync(int userId, CancellationToken cancellationToken = default);

}