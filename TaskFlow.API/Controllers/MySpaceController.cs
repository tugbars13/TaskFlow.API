using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs.MySpace;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
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

        // GET /api/myspace/folders
        [HttpGet("folders")]
        public async Task<ActionResult<ApiResponse<IEnumerable<MySpaceFolderDto>>>> GetFolders()
        {
            var folders = await _mySpaceService.GetAllFoldersAsync();
            return Ok(new ApiResponse<IEnumerable<MySpaceFolderDto>>
            {
                Success = true,
                Data = folders
            });
        }

        // POST /api/myspace/folders
        [HttpPost("folders")]
        public async Task<ActionResult<ApiResponse<MySpaceFolderDto>>> CreateFolder(CreateMySpaceFolderDto dto)
        {
            var folder = await _mySpaceService.CreateFolderAsync(dto);
            return StatusCode(201, new ApiResponse<MySpaceFolderDto>
            {
                Success = true,
                Message = "Folder created successfully.",
                Data = folder
            });
        }

        // PUT /api/myspace/folders/{id}
        [HttpPut("folders/{id}")]
        public async Task<ActionResult<ApiResponse<MySpaceFolderDto>>> UpdateFolder(int id, UpdateMySpaceFolderDto dto)
        {
            var folder = await _mySpaceService.UpdateFolderAsync(id, dto);
            return Ok(new ApiResponse<MySpaceFolderDto>
            {
                Success = true,
                Message = "Folder updated successfully.",
                Data = folder
            });
        }

        // DELETE /api/myspace/folders/{id}
        [HttpDelete("folders/{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteFolder(int id)
        {
            await _mySpaceService.DeleteFolderAsync(id);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Folder deleted successfully."
            });
        }

        // GET /api/myspace/pages
        [HttpGet("pages")]
        public async Task<ActionResult<ApiResponse<IEnumerable<MySpacePageDto>>>> GetPages()
        {
            var pages = await _mySpaceService.GetAllPagesAsync();
            return Ok(new ApiResponse<IEnumerable<MySpacePageDto>>
            {
                Success = true,
                Data = pages
            });
        }

        // GET /api/myspace/pages/{id}
        [HttpGet("pages/{id}")]
        public async Task<ActionResult<ApiResponse<MySpacePageDto>>> GetPage(int id)
        {
            var page = await _mySpaceService.GetPageByIdAsync(id);
            return Ok(new ApiResponse<MySpacePageDto>
            {
                Success = true,
                Data = page
            });
        }

        // GET /api/myspace/folders/{folderId}/pages
        [HttpGet("folders/{folderId}/pages")]
        public async Task<ActionResult<ApiResponse<IEnumerable<MySpacePageDto>>>> GetPagesByFolder(int folderId)
        {
            var pages = await _mySpaceService.GetPagesByFolderIdAsync(folderId);
            return Ok(new ApiResponse<IEnumerable<MySpacePageDto>>
            {
                Success = true,
                Data = pages
            });
        }

        // POST /api/myspace/pages
        [HttpPost("pages")]
        public async Task<ActionResult<ApiResponse<MySpacePageDto>>> CreatePage(CreateMySpacePageDto dto)
        {
            var page = await _mySpaceService.CreatePageAsync(dto);
            return StatusCode(201, new ApiResponse<MySpacePageDto>
            {
                Success = true,
                Message = "Page created successfully.",
                Data = page
            });
        }

        // PUT /api/myspace/pages/{id}
        [HttpPut("pages/{id}")]
        public async Task<ActionResult<ApiResponse<MySpacePageDto>>> UpdatePage(int id, UpdateMySpacePageDto dto)
        {
            var page = await _mySpaceService.UpdatePageAsync(id, dto);
            return Ok(new ApiResponse<MySpacePageDto>
            {
                Success = true,
                Message = "Page updated successfully.",
                Data = page
            });
        }

        // DELETE /api/myspace/pages/{id}
        [HttpDelete("pages/{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeletePage(int id)
        {
            await _mySpaceService.DeletePageAsync(id);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Page deleted successfully."
            });
        }
    }
}

