using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Services
{
    public interface IMySpaceService
    {
        Task<IEnumerable<MySpaceFolderDto>> GetAllFoldersAsync();
        Task<MySpaceFolderDto> CreateFolderAsync(CreateMySpaceFolderDto dto);
        Task<MySpaceFolderDto> UpdateFolderAsync(int id, UpdateMySpaceFolderDto dto);
        Task DeleteFolderAsync(int id);

        Task<IEnumerable<MySpacePageDto>> GetAllPagesAsync();
        Task<IEnumerable<MySpacePageDto>> GetPagesByFolderIdAsync(int folderId);
        Task<MySpacePageDto> GetPageByIdAsync(int id);
        Task<MySpacePageDto> CreatePageAsync(CreateMySpacePageDto dto);
        Task<MySpacePageDto> UpdatePageAsync(int id, UpdateMySpacePageDto dto);
        Task DeletePageAsync(int id);
    }
}
