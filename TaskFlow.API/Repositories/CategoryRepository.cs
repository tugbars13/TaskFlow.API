using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomCategory>> GetCustomCategoriesAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.CustomCategories
            .AsNoTracking()
            .Where(c => c.UserId == null || c.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> CategoryExistsAsync(int userId, string name, CancellationToken cancellationToken = default)
    {
        return await _context.CustomCategories
            .AnyAsync(c => c.UserId == userId && c.Name == name, cancellationToken);
    }

    public async Task<CustomCategory> AddCategoryAsync(
        CustomCategory category, CancellationToken cancellationToken = default)
    {
        _context.CustomCategories.Add(category);


        return category;
    }

    public async Task<CustomCategory?> GetCategoryByNameAsync(
        int userId,
        string name, CancellationToken cancellationToken = default)
    {
        return await _context.CustomCategories
            .FirstOrDefaultAsync(c =>
                c.UserId == userId &&
                c.Name == name, cancellationToken);
    }

    public async Task<bool> DeleteCategoryAsync(
        CustomCategory category, CancellationToken cancellationToken = default)
    {
        _context.CustomCategories.Remove(category);


        return true;
    }
}
