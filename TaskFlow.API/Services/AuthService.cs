using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;
using BCrypt.Net;

namespace TaskFlow.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly ITaskRepository _taskRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        ITaskRepository taskRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _taskRepository = taskRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResponseDto?> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);

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

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _tokenService.CreateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);

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

    public async Task<UserDto?> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user == null)
            return null;

        return MapToUserDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            return null;

        user.FullName = dto.FullName;
        user.DisplayName = dto.DisplayName;
        user.Bio = dto.Bio;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToUserDto(user);
    }

    public async Task<bool> DeleteAccountAsync(int userId, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return false;
            }

            // Orchestration: Delete task assignees to satisfy DB Restrict behavior
            await _taskRepository.DeleteTaskAssigneesByUserIdAsync(userId, cancellationToken);

            await _userRepository.DeleteUserWithRelationsAsync(userId, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
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