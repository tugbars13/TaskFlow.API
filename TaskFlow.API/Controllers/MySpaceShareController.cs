using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs.MySpace;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/myspace/share")]
public class MySpaceShareController : ControllerBase
{
    private readonly IMySpaceService _mySpaceService;

    public MySpaceShareController(IMySpaceService mySpaceService)
    {
        _mySpaceService = mySpaceService;
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var id))
            throw new UnauthorizedAccessException();
        return id;
    }

    // GET /api/myspace/share/{token}
    [HttpGet("{token}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SharedPageDto>>> GetSharedPage(string token, CancellationToken cancellationToken)
    {
        try
        {
            var page = await _mySpaceService.GetSharedPageAsync(token, cancellationToken);
            return Ok(new ApiResponse<SharedPageDto>
            {
                Success = true,
                Data = page
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<SharedPageDto> { Success = false, Message = ex.Message });
        }
    }

    // PUT /api/myspace/share/{token}
    [HttpPut("{token}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<SharedPageDto>>> UpdateSharedPage(string token, [FromBody] UpdateSharedPageDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var updatedPage = await _mySpaceService.UpdateSharedPageAsync(token, userId, dto, cancellationToken);
            return Ok(new ApiResponse<SharedPageDto>
            {
                Success = true,
                Message = "Shared page updated successfully.",
                Data = updatedPage
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<SharedPageDto> { Success = false, Message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ApiResponse<SharedPageDto> { Success = false, Message = ex.Message });
        }
    }
}
