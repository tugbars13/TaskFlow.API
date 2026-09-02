using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs.MySpace;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MySpaceController : ControllerBase
{
    private readonly IMySpaceService _mySpaceService;

    public MySpaceController(IMySpaceService mySpaceService)
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

    // GET /api/myspace/folders
    [HttpGet("folders")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MySpaceFolderDto>>>> GetFolders(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var folders = await _mySpaceService.GetAllFoldersAsync(userId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MySpaceFolderDto>>
        {
            Success = true,
            Data = folders
        });
    }

    // POST /api/myspace/folders
    [HttpPost("folders")]
    public async Task<ActionResult<ApiResponse<MySpaceFolderDto>>> CreateFolder(
        [FromBody] CreateMySpaceFolderDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var folder = await _mySpaceService.CreateFolderAsync(userId, dto, cancellationToken);

        return StatusCode(201, new ApiResponse<MySpaceFolderDto>
        {
            Success = true,
            Message = "Folder created successfully.",
            Data = folder
        });
    }

    // PUT /api/myspace/folders/{id}
    [HttpPut("folders/{id}")]
    public async Task<ActionResult<ApiResponse<MySpaceFolderDto>>> UpdateFolder(
        int id,
        [FromBody] UpdateMySpaceFolderDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var folder = await _mySpaceService.UpdateFolderAsync(
            id,
            userId,
            dto, cancellationToken);

        return Ok(new ApiResponse<MySpaceFolderDto>
        {
            Success = true,
            Message = "Folder updated successfully.",
            Data = folder
        });
    }

    // DELETE /api/myspace/folders/{id}
    [HttpDelete("folders/{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteFolder(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        await _mySpaceService.DeleteFolderAsync(id, userId, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Folder deleted successfully."
        });
    }

    // GET /api/myspace/pages
    [HttpGet("pages")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MySpacePageDto>>>> GetPages(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var pages = await _mySpaceService.GetAllPagesAsync(userId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MySpacePageDto>>
        {
            Success = true,
            Data = pages
        });
    }

    // GET /api/myspace/pages/{id}
    [HttpGet("pages/{id}")]
    public async Task<ActionResult<ApiResponse<MySpacePageDto>>> GetPage(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var page = await _mySpaceService.GetPageByIdAsync(id, userId, cancellationToken);

        return Ok(new ApiResponse<MySpacePageDto>
        {
            Success = true,
            Data = page
        });
    }

    // GET /api/myspace/folders/{folderId}/pages
    [HttpGet("folders/{folderId}/pages")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MySpacePageDto>>>> GetPagesByFolder(
        int folderId, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var pages = await _mySpaceService.GetPagesByFolderIdAsync(
            folderId,
            userId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MySpacePageDto>>
        {
            Success = true,
            Data = pages
        });
    }

    // POST /api/myspace/pages
    [HttpPost("pages")]
    public async Task<ActionResult<ApiResponse<MySpacePageDto>>> CreatePage(
        [FromBody] CreateMySpacePageDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var page = await _mySpaceService.CreatePageAsync(userId, dto, cancellationToken);

        return StatusCode(201, new ApiResponse<MySpacePageDto>
        {
            Success = true,
            Message = "Page created successfully.",
            Data = page
        });
    }

    // PUT /api/myspace/pages/{id}
    [HttpPut("pages/{id}")]
    public async Task<ActionResult<ApiResponse<MySpacePageDto>>> UpdatePage(
        int id,
        [FromBody] UpdateMySpacePageDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var page = await _mySpaceService.UpdatePageAsync(
            id,
            userId,
            dto, cancellationToken);

        return Ok(new ApiResponse<MySpacePageDto>
        {
            Success = true,
            Message = "Page updated successfully.",
            Data = page
        });
    }

    // DELETE /api/myspace/pages/{id}
    [HttpDelete("pages/{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeletePage(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        await _mySpaceService.DeletePageAsync(id, userId, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Page deleted successfully."
        });
    }
}