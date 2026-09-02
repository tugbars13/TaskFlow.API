using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories
{
    public class MySpacePageRepository : IMySpacePageRepository
    {
        private readonly AppDbContext _context;

        public MySpacePageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MySpacePage>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.MySpacePages
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<MySpacePage>> GetByFolderIdAsync(int folderId, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.MySpacePages
                .AsNoTracking()
                .Where(p => p.FolderId == folderId && p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<MySpacePage?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.MySpacePages
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId, cancellationToken);
        }

        public async Task<MySpacePage> CreateAsync(MySpacePage page, CancellationToken cancellationToken = default)
        {
            await _context.MySpacePages.AddAsync(page, cancellationToken);
            return page;
        }

        public async Task<MySpacePage> UpdateAsync(MySpacePage page, CancellationToken cancellationToken = default)
        {
            _context.MySpacePages.Update(page);
            return await Task.FromResult(page);
        }

        public async Task DeleteAsync(MySpacePage page, CancellationToken cancellationToken = default)
        {
            _context.MySpacePages.Remove(page);
            await Task.CompletedTask;
        }
    }
}
