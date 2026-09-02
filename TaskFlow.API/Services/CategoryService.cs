using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs.Category;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CategoryDto>> GetCustomCategoriesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var categories = await _repository.GetCustomCategoriesAsync(userId, cancellationToken);

        return categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToList();
    }

    public async Task<CustomCategory> AddCategoryAsync(int userId, string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Kategori adı boş olamaz.");

        name = name.Trim();

        var exists = await _repository.CategoryExistsAsync(userId, name, cancellationToken);

        if (exists)
            throw new InvalidOperationException("Bu kategori zaten mevcut.");

        var newCategory = new CustomCategory
        {
            Name = name,
            UserId = userId
        };

        var createdCategory = await _repository.AddCategoryAsync(newCategory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return createdCategory;
    }

    public async Task<bool> DeleteCategoryAsync(int userId, string name, CancellationToken cancellationToken = default)
    {
        var category = await _repository.GetCategoryByNameAsync(userId, name, cancellationToken);

        if (category == null)
            return false;

        var result = await _repository.DeleteCategoryAsync(category, cancellationToken);
        if (result)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        return result;
    }
}