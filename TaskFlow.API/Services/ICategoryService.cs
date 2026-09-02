using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs.Category;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetCustomCategoriesAsync(int userId, CancellationToken cancellationToken = default);
    Task<CustomCategory> AddCategoryAsync(int userId, string name, CancellationToken cancellationToken = default);
    Task<bool> DeleteCategoryAsync(int userId, string name, CancellationToken cancellationToken = default);
}