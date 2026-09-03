using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Security.Cryptography;
using System.Text;
using TaskFlow.API.DTOs.MySpace;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class MySpaceService : IMySpaceService
{
    private readonly IMySpaceFolderRepository _folderRepository;
    private readonly IMySpacePageRepository _pageRepository;
    private readonly IMySpacePageShareRepository _shareRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MySpaceService(
        IMySpaceFolderRepository folderRepository,
        IMySpacePageRepository pageRepository,
        IMySpacePageShareRepository shareRepository,
        IUnitOfWork unitOfWork)
    {
        _folderRepository = folderRepository;
        _pageRepository = pageRepository;
        _shareRepository = shareRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<MySpaceFolderDto>> GetAllFoldersAsync(int userId, CancellationToken cancellationToken = default)
    {
        var folders = await _folderRepository.GetAllByUserIdAsync(userId, cancellationToken);

        return folders.Select(f => new MySpaceFolderDto
        {
            Id = f.Id,
            Name = f.Name,
            ParentFolderId = f.ParentFolderId,
            CreatedAt = f.CreatedAt,
            UpdatedAt = f.UpdatedAt
        });
    }

    public async Task<MySpaceFolderDto> CreateFolderAsync(
        int userId,
        CreateMySpaceFolderDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.ParentFolderId.HasValue)
        {
            var parent = await _folderRepository.GetByIdAsync(dto.ParentFolderId.Value, userId, cancellationToken);
            if (parent == null)
            {
                throw new KeyNotFoundException($"Parent folder with ID {dto.ParentFolderId} not found.");
            }
        }

        var folder = new MySpaceFolder
        {
            Name = dto.Name,
            UserId = userId,
            ParentFolderId = dto.ParentFolderId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _folderRepository.CreateAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MySpaceFolderDto
        {
            Id = created.Id,
            Name = created.Name,
            ParentFolderId = created.ParentFolderId,
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

        if (dto.ParentFolderId.HasValue && dto.ParentFolderId != folder.ParentFolderId)
        {
            if (dto.ParentFolderId == id)
            {
                throw new ArgumentException("A folder cannot be its own parent.");
            }
            var parent = await _folderRepository.GetByIdAsync(dto.ParentFolderId.Value, userId, cancellationToken);
            if (parent == null)
            {
                throw new KeyNotFoundException($"Parent folder with ID {dto.ParentFolderId} not found.");
            }
        }

        folder.Name = dto.Name;
        folder.ParentFolderId = dto.ParentFolderId;
        folder.UpdatedAt = DateTime.UtcNow;

        var updated = await _folderRepository.UpdateAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MySpaceFolderDto
        {
            Id = updated.Id,
            Name = updated.Name,
            ParentFolderId = updated.ParentFolderId,
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

        var allFolders = await _folderRepository.GetAllByUserIdAsync(userId, cancellationToken);
        if (allFolders.Any(f => f.ParentFolderId == id))
        {
            throw new ArgumentException("Cannot delete folder because it contains subfolders.");
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

    private string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }

    public async Task<PageShareResponseDto> CreateShareLinkAsync(int pageId, int userId, CreatePageShareDto dto, CancellationToken cancellationToken = default)
    {
        var page = await _pageRepository.GetByIdAsync(pageId, userId, cancellationToken);
        if (page == null)
            throw new KeyNotFoundException($"Page with ID {pageId} not found or you don't have access.");

        var rawToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"); // 64 chars
        var tokenHash = ComputeSha256Hash(rawToken);

        var share = new MySpacePageShare
        {
            PageId = pageId,
            TokenHash = tokenHash,
            Permission = dto.Permission,
            CreatedAt = DateTime.UtcNow
        };

        await _shareRepository.CreateAsync(share, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PageShareResponseDto
        {
            Token = rawToken,
            Permission = share.Permission,
            ShareUrl = $"/myspace/share/{rawToken}"
        };
    }

    public async Task<SharedPageDto> GetSharedPageAsync(string token, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeSha256Hash(token);
        var share = await _shareRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        
        if (share == null || share.Page == null)
            throw new KeyNotFoundException("Invalid or expired share token.");

        if (share.ExpiresAt.HasValue && share.ExpiresAt.Value < DateTime.UtcNow)
        {
            await _shareRepository.DeleteAsync(share, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new KeyNotFoundException("Share token has expired.");
        }

        return new SharedPageDto
        {
            Id = share.Page.Id,
            Title = share.Page.Title,
            Icon = share.Page.Icon,
            Description = share.Page.Description,
            Content = share.Page.Content,
            Permission = share.Permission
        };
    }

    public async Task<SharedPageDto> UpdateSharedPageAsync(string token, int userId, UpdateSharedPageDto dto, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeSha256Hash(token);
        var share = await _shareRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (share == null || share.Page == null)
            throw new KeyNotFoundException("Invalid or expired share token.");

        if (share.ExpiresAt.HasValue && share.ExpiresAt.Value < DateTime.UtcNow)
        {
            await _shareRepository.DeleteAsync(share, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new KeyNotFoundException("Share token has expired.");
        }

        if (share.Permission != "Edit")
            throw new UnauthorizedAccessException("You do not have permission to edit this page.");

        share.Page.Title = dto.Title;
        share.Page.Icon = dto.Icon;
        share.Page.Description = dto.Description;
        share.Page.Content = dto.Content;
        share.Page.UpdatedAt = DateTime.UtcNow;

        var updated = await _pageRepository.UpdateAsync(share.Page, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SharedPageDto
        {
            Id = updated.Id,
            Title = updated.Title,
            Icon = updated.Icon,
            Description = updated.Description,
            Content = updated.Content,
            Permission = share.Permission
        };
    }
}