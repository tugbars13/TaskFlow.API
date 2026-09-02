using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public interface ICategoryRepository
{
    Task<List<CustomCategory>> GetCustomCategoriesAsync(int userId, CancellationToken cancellationToken = default);

    Task<bool> CategoryExistsAsync(int userId, string name, CancellationToken cancellationToken = default);

    Task<CustomCategory> AddCategoryAsync(CustomCategory category, CancellationToken cancellationToken = default);

    Task<CustomCategory?> GetCategoryByNameAsync(
        int userId,
        string name, CancellationToken cancellationToken = default);

    Task<bool> DeleteCategoryAsync(CustomCategory category, CancellationToken cancellationToken = default);
}
