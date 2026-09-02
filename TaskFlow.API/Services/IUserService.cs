// Services/IUserService.cs
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync(PaginationDto pagination, CancellationToken cancellationToken = default);
}