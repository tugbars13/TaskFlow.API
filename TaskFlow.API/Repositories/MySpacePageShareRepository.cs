using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public class MySpacePageShareRepository : IMySpacePageShareRepository
{
    private readonly AppDbContext _context;

    public MySpacePageShareRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MySpacePageShare?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.MySpacePageShares
            .Include(s => s.Page)
            .FirstOrDefaultAsync(s => s.TokenHash == tokenHash, cancellationToken);
    }

    public async Task<MySpacePageShare> CreateAsync(MySpacePageShare share, CancellationToken cancellationToken = default)
    {
        await _context.MySpacePageShares.AddAsync(share, cancellationToken);
        return share;
    }

    public Task DeleteAsync(MySpacePageShare share, CancellationToken cancellationToken = default)
    {
        _context.MySpacePageShares.Remove(share);
        return Task.CompletedTask;
    }
}
