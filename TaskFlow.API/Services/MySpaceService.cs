using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using TaskFlow.API.DTOs.MySpace;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class MySpaceService : IMySpaceService
{
    private readonly IMySpaceFolderRepository _folderRepository;
    private readonly IMySpacePageRepository _pageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MySpaceService(
        IMySpaceFolderRepository folderRepository,
        IMySpacePageRepository pageRepository,
        IUnitOfWork unitOfWork)
    {
        _folderRepository = folderRepository;
        _pageRepository = pageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<MySpaceFolderDto>> GetAllFoldersAsync(int userId, CancellationToken cancellationToken = default)
    {
        var folders = await _folderRepository.GetAllByUserIdAsync(userId, cancellationToken);

        return folders.Select(f => new MySpaceFolderDto
        {
            Id = f.Id,
            Name = f.Name,
            CreatedAt = f.CreatedAt,
            UpdatedAt = f.UpdatedAt
        });
    }

    public async Task<MySpaceFolderDto> CreateFolderAsync(
        int userId,
        CreateMySpaceFolderDto dto, CancellationToken cancellationToken = default)
    {
        var folder = new MySpaceFolder
        {
            Name = dto.Name,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _folderRepository.CreateAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MySpaceFolderDto
        {
            Id = created.Id,
            Name = created.Name,
            CreatedAt = created.CreatedAt,
            UpdatedAt = created.UpdatedAt
        };
    }

    public async Task<MySpaceFolderDto> UpdateFolderAsync(
        int id,
        int userId,
        UpdateMySpaceFolderDto dto, CancellationToken cancellationToken = default)
    {
        var folder = await _folderRepository.GetByIdAsync(id, userId, cancellationToken);

        if (folder == null)
            throw new KeyNotFoundException(
                $"Folder with ID {id} not found.");

        folder.Name = dto.Name;
        folder.UpdatedAt = DateTime.UtcNow;

        var updated = await _folderRepository.UpdateAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MySpaceFolderDto
        {
            Id = updated.Id,
            Name = updated.Name,
            CreatedAt = updated.CreatedAt,
            UpdatedAt = updated.UpdatedAt
        };
    }

    public async Task DeleteFolderAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var folder = await _folderRepository.GetByIdAsync(id, userId, cancellationToken);

        if (folder == null)
            throw new KeyNotFoundException(
                $"Folder with ID {id} not found.");

        var folderPages = await _pageRepository.GetByFolderIdAsync(
            id,
            userId, cancellationToken);

        if (folderPages.Any())
        {
            throw new ArgumentException(
                "Cannot delete folder because it contains pages.");
        }

        await _folderRepository.DeleteAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<MySpacePageDto>> GetAllPagesAsync(
        int userId, CancellationToken cancellationToken = default)
    {
        var pages = await _pageRepository.GetAllByUserIdAsync(userId, cancellationToken);

        return pages.Select(MapToDto);
    }

    public async Task<IEnumerable<MySpacePageDto>> GetPagesByFolderIdAsync(
        int folderId,
        int userId, CancellationToken cancellationToken = default)
    {
        var pages = await _pageRepository.GetByFolderIdAsync(
            folderId,
            userId, cancellationToken);

        return pages.Select(MapToDto);
    }

    public async Task<MySpacePageDto> GetPageByIdAsync(
        int id,
        int userId, CancellationToken cancellationToken = default)
    {
        var page = await _pageRepository.GetByIdAsync(id, userId, cancellationToken);

        if (page == null)
            throw new KeyNotFoundException(
                $"Page with ID {id} not found.");

        return MapToDto(page);
    }

    public async Task<MySpacePageDto> CreatePageAsync(
        int userId,
        CreateMySpacePageDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.FolderId.HasValue)
        {
            var folder = await _folderRepository.GetByIdAsync(
                dto.FolderId.Value,
                userId, cancellationToken);

            if (folder == null)
            {
                throw new KeyNotFoundException(
                    $"Folder with ID {dto.FolderId} not found.");
            }
        }

        var page = new MySpacePage
        {
            UserId = userId,
            FolderId = dto.FolderId,
            Title = dto.Title,
            Icon = dto.Icon,
            Description = dto.Description,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _pageRepository.CreateAsync(page, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(created);
    }

    public async Task<MySpacePageDto> UpdatePageAsync(
        int id,
        int userId,
        UpdateMySpacePageDto dto, CancellationToken cancellationToken = default)
    {
        var page = await _pageRepository.GetByIdAsync(id, userId, cancellationToken);

        if (page == null)
            throw new KeyNotFoundException(
                $"Page with ID {id} not found.");

        if (dto.FolderId.HasValue &&
            dto.FolderId != page.FolderId)
        {
            var folder = await _folderRepository.GetByIdAsync(
                dto.FolderId.Value,
                userId, cancellationToken);

            if (folder == null)
            {
                throw new KeyNotFoundException(
                    $"Folder with ID {dto.FolderId} not found.");
            }
        }

        page.FolderId = dto.FolderId;
        page.Title = dto.Title;
        page.Icon = dto.Icon;
        page.Description = dto.Description;
        page.Content = dto.Content;
        page.UpdatedAt = DateTime.UtcNow;

        var updated = await _pageRepository.UpdateAsync(page, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(updated);
    }

    public async Task DeletePageAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var page = await _pageRepository.GetByIdAsync(id, userId, cancellationToken);

        if (page == null)
            throw new KeyNotFoundException(
                $"Page with ID {id} not found.");

        await _pageRepository.DeleteAsync(page, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static MySpacePageDto MapToDto(MySpacePage page)
    {
        return new MySpacePageDto
        {
            Id = page.Id,
            FolderId = page.FolderId,
            Title = page.Title,
            Icon = page.Icon,
            Description = page.Description,
            Content = page.Content,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        };
    }
}