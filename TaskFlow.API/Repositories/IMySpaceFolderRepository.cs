using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public interface IMySpaceFolderRepository
    {
        Task<IEnumerable<MySpaceFolder>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<MySpaceFolder?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
        Task<MySpaceFolder> CreateAsync(MySpaceFolder folder, CancellationToken cancellationToken = default);
        Task<MySpaceFolder> UpdateAsync(MySpaceFolder folder, CancellationToken cancellationToken = default);
        Task DeleteAsync(MySpaceFolder folder, CancellationToken cancellationToken = default);
    }
}
