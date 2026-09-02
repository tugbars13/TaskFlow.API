using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs.Category;
using TaskFlow.API.Responses;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private int? GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(userIdStr, out var userId)
            ? userId
            : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomCategories(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
            return Unauthorized();

        var categories = await _categoryService.GetCustomCategoriesAsync(userId.Value, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<CategoryDto>>
        {
            Success = true,
            Message = "Kategoriler getirildi.",
            Data = categories
        });
    }

    [HttpPost]
    public async Task<IActionResult> AddCustomCategory(
        [FromBody] CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
            return Unauthorized();

        var category = await _categoryService.AddCategoryAsync(
            userId.Value,
            dto.Name, cancellationToken);

        return Ok(new ApiResponse<CategoryDto>
        {
            Success = true,
            Message = "Kategori başarıyla eklendi.",
            Data = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            }
        });
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> DeleteCustomCategory(string name, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
            return Unauthorized();

        var success = await _categoryService.DeleteCategoryAsync(
            userId.Value,
            name, cancellationToken);

        if (!success)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Kategori bulunamadı."
            });
        }

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Kategori silindi.",
            Data = name
        });
    }
}