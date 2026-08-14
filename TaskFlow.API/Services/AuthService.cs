using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;
using BCrypt.Net;

namespace TaskFlow.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto?> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);

        if (existingUser != null)
        {
            return null;
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = passwordHash,
            CreatedDate = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);

        if (user == null)
            return null;

        bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash);

        if (!isPasswordCorrect)
            return null;

        var token = _tokenService.CreateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return null;

        return MapToUserDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        user.FullName = dto.FullName;
        user.DisplayName = dto.DisplayName;
        user.Bio = dto.Bio;

        await _userRepository.SaveChangesAsync();

        return MapToUserDto(user);
    }

    public async Task<bool> DeleteAccountAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        await _userRepository.DeleteUserWithRelationsAsync(userId);
        return true;
    }

    // BU METOT EKSİKSE, EN ALTA EKLE
    private static UserDto MapToUserDto(User user)
    {
        var nameParts = (user.FullName ?? "")
            .Trim()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var firstName = nameParts.Length > 0 ? nameParts[0] : user.FullName;
        var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName ?? string.Empty,
            FirstName = firstName ?? string.Empty,
            LastName = lastName,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        };
    }
}