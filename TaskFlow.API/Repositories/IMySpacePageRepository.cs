using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface IMySpacePageRepository
    {
        Task<IEnumerable<MySpacePage>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MySpacePage>> GetByFolderIdAsync(int folderId, int userId, CancellationToken cancellationToken = default);
        Task<MySpacePage?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
        Task<MySpacePage> CreateAsync(MySpacePage page, CancellationToken cancellationToken = default);
        Task<MySpacePage> UpdateAsync(MySpacePage page, CancellationToken cancellationToken = default);
        Task DeleteAsync(MySpacePage page, CancellationToken cancellationToken = default);
    }
}
