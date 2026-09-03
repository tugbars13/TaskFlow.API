using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public interface IMySpacePageShareRepository
{
    Task<MySpacePageShare?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<MySpacePageShare> CreateAsync(MySpacePageShare share, CancellationToken cancellationToken = default);
    Task DeleteAsync(MySpacePageShare share, CancellationToken cancellationToken = default);
}
