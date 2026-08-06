// Services/UserService.cs
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(MapToUserDto).ToList();
    }

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
            FullName = user.FullName,
            FirstName = firstName,
            LastName = lastName,
            Email = user.Email
        };
    }
}