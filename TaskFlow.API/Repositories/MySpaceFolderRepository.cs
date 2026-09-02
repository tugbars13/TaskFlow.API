using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public class MySpaceFolderRepository : IMySpaceFolderRepository
    {
        private readonly AppDbContext _context;

        public MySpaceFolderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MySpaceFolder>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.MySpaceFolders
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<MySpaceFolder?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.MySpaceFolders
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId, cancellationToken);
        }

        public async Task<MySpaceFolder> CreateAsync(MySpaceFolder folder, CancellationToken cancellationToken = default)
        {
            await _context.MySpaceFolders.AddAsync(folder, cancellationToken);
            return folder;
        }

        public async Task<MySpaceFolder> UpdateAsync(MySpaceFolder folder, CancellationToken cancellationToken = default)
        {
            _context.MySpaceFolders.Update(folder);
            return await Task.FromResult(folder);
        }

        public async Task DeleteAsync(MySpaceFolder folder, CancellationToken cancellationToken = default)
        {
            _context.MySpaceFolders.Remove(folder);
            await Task.CompletedTask;
        }
    }
}
