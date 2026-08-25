using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface IMySpaceFolderRepository
    {
        Task<IEnumerable<MySpaceFolder>> GetAllAsync();
        Task<MySpaceFolder?> GetByIdAsync(int id);
        Task<MySpaceFolder> CreateAsync(MySpaceFolder folder);
        Task<MySpaceFolder> UpdateAsync(MySpaceFolder folder);
        Task DeleteAsync(MySpaceFolder folder);
    }
}
