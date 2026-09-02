using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Services;

public interface IMySpaceService
{
    Task<IEnumerable<MySpaceFolderDto>> GetAllFoldersAsync(int userId, CancellationToken cancellationToken = default);
    Task<MySpaceFolderDto> CreateFolderAsync(int userId, CreateMySpaceFolderDto dto, CancellationToken cancellationToken = default);
    Task<MySpaceFolderDto> UpdateFolderAsync(int id, int userId, UpdateMySpaceFolderDto dto, CancellationToken cancellationToken = default);
    Task DeleteFolderAsync(int id, int userId, CancellationToken cancellationToken = default);

    Task<IEnumerable<MySpacePageDto>> GetAllPagesAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MySpacePageDto>> GetPagesByFolderIdAsync(int folderId, int userId, CancellationToken cancellationToken = default);
    Task<MySpacePageDto> GetPageByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<MySpacePageDto> CreatePageAsync(int userId, CreateMySpacePageDto dto, CancellationToken cancellationToken = default);
    Task<MySpacePageDto> UpdatePageAsync(int id, int userId, UpdateMySpacePageDto dto, CancellationToken cancellationToken = default);
    Task DeletePageAsync(int id, int userId, CancellationToken cancellationToken = default);
}