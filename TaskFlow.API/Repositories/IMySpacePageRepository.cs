using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface IMySpacePageRepository
    {
        Task<IEnumerable<MySpacePage>> GetAllAsync();
        Task<IEnumerable<MySpacePage>> GetByFolderIdAsync(int folderId);
        Task<MySpacePage?> GetByIdAsync(int id);
        Task<MySpacePage> CreateAsync(MySpacePage page);
        Task<MySpacePage> UpdateAsync(MySpacePage page);
        Task DeleteAsync(MySpacePage page);
    }
}
