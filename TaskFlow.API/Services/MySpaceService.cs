using TaskFlow.API.DTOs.MySpace;

using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services
{
    public class MySpaceService : IMySpaceService
    {
        private readonly IMySpaceFolderRepository _folderRepository;
        private readonly IMySpacePageRepository _pageRepository;

        public MySpaceService(IMySpaceFolderRepository folderRepository, IMySpacePageRepository pageRepository)
        {
            _folderRepository = folderRepository;
            _pageRepository = pageRepository;
        }

        public async Task<IEnumerable<MySpaceFolderDto>> GetAllFoldersAsync()
        {
            var folders = await _folderRepository.GetAllAsync();
            return folders.Select(f => new MySpaceFolderDto
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            });
        }

        public async Task<MySpaceFolderDto> CreateFolderAsync(CreateMySpaceFolderDto dto)
        {
            var folder = new MySpaceFolder
            {
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _folderRepository.CreateAsync(folder);
            return new MySpaceFolderDto
            {
                Id = created.Id,
                Name = created.Name,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };
        }

        public async Task<MySpaceFolderDto> UpdateFolderAsync(int id, UpdateMySpaceFolderDto dto)
        {
            var folder = await _folderRepository.GetByIdAsync(id);
            if (folder == null)
                throw new KeyNotFoundException($"Folder with ID {id} not found.");

            folder.Name = dto.Name;
            folder.UpdatedAt = DateTime.UtcNow;

            var updated = await _folderRepository.UpdateAsync(folder);
            return new MySpaceFolderDto
            {
                Id = updated.Id,
                Name = updated.Name,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            };
        }

        public async Task DeleteFolderAsync(int id)
        {
            var folder = await _folderRepository.GetByIdAsync(id);
            if (folder == null)
                throw new KeyNotFoundException($"Folder with ID {id} not found.");

            // Since we use Restrict on delete, if there are pages, EF Core will throw an exception.
            // But we can let the exception handling middleware catch it or check here explicitly.
            var folderPages = await _pageRepository.GetByFolderIdAsync(id);
            if (folderPages.Any())
                throw new ArgumentException("Cannot delete folder because it contains pages.");

            await _folderRepository.DeleteAsync(folder);
        }

        public async Task<IEnumerable<MySpacePageDto>> GetAllPagesAsync()
        {
            var pages = await _pageRepository.GetAllAsync();
            return pages.Select(p => MapToDto(p));
        }

        public async Task<IEnumerable<MySpacePageDto>> GetPagesByFolderIdAsync(int folderId)
        {
            var pages = await _pageRepository.GetByFolderIdAsync(folderId);
            return pages.Select(p => MapToDto(p));
        }

        public async Task<MySpacePageDto> GetPageByIdAsync(int id)
        {
            var page = await _pageRepository.GetByIdAsync(id);
            if (page == null)
                throw new KeyNotFoundException($"Page with ID {id} not found.");

            return MapToDto(page);
        }

        public async Task<MySpacePageDto> CreatePageAsync(CreateMySpacePageDto dto)
        {
            if (dto.FolderId.HasValue)
            {
                var folder = await _folderRepository.GetByIdAsync(dto.FolderId.Value);
                if (folder == null)
                    throw new KeyNotFoundException($"Folder with ID {dto.FolderId} not found.");
            }

            var page = new MySpacePage
            {
                FolderId = dto.FolderId,
                Title = dto.Title,
                Icon = dto.Icon,
                Description = dto.Description,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _pageRepository.CreateAsync(page);
            return MapToDto(created);
        }

        public async Task<MySpacePageDto> UpdatePageAsync(int id, UpdateMySpacePageDto dto)
        {
            var page = await _pageRepository.GetByIdAsync(id);
            if (page == null)
                throw new KeyNotFoundException($"Page with ID {id} not found.");

            if (dto.FolderId.HasValue && dto.FolderId != page.FolderId)
            {
                var folder = await _folderRepository.GetByIdAsync(dto.FolderId.Value);
                if (folder == null)
                    throw new KeyNotFoundException($"Folder with ID {dto.FolderId} not found.");
            }

            page.FolderId = dto.FolderId;
            page.Title = dto.Title;
            page.Icon = dto.Icon;
            page.Description = dto.Description;
            page.Content = dto.Content;
            page.UpdatedAt = DateTime.UtcNow;

            var updated = await _pageRepository.UpdateAsync(page);
            return MapToDto(updated);
        }

        public async Task DeletePageAsync(int id)
        {
            var page = await _pageRepository.GetByIdAsync(id);
            if (page == null)
                throw new KeyNotFoundException($"Page with ID {id} not found.");

            await _pageRepository.DeleteAsync(page);
        }

        private MySpacePageDto MapToDto(MySpacePage page)
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
}


