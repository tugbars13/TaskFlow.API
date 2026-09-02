using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Services;
using TaskFlow.API.DTOs;
namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // GET: api/Users
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers([FromQuery] PaginationDto pagination, CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllUsersAsync(pagination, cancellationToken);
        return Ok(users);
    }
}
