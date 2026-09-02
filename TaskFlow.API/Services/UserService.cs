// Services/UserService.cs
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
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

    public async Task<List<UserDto>> GetAllUsersAsync(PaginationDto pagination, CancellationToken cancellationToken = default)
    {
        int pageNumber = pagination?.PageNumber > 0 ? pagination.PageNumber : 1;
        int pageSize = pagination?.PageSize > 0 ? pagination.PageSize : 50;

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var users = await _userRepository.GetAllAsync(pageNumber, pageSize, cancellationToken);

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
            FullName = user.FullName ?? string.Empty,
            FirstName = firstName ?? string.Empty,
            LastName = lastName,
            Email = user.Email
        };
    }
}