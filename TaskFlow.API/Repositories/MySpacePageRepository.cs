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

        public async Task<IEnumerable<MySpacePage>> GetAllAsync()
        {
            return await _context.MySpacePages
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<MySpacePage>> GetByFolderIdAsync(int folderId)
        {
            return await _context.MySpacePages
                .Where(p => p.FolderId == folderId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<MySpacePage?> GetByIdAsync(int id)
        {
            return await _context.MySpacePages.FindAsync(id);
        }

        public async Task<MySpacePage> CreateAsync(MySpacePage page)
        {
            _context.MySpacePages.Add(page);
            await _context.SaveChangesAsync();
            return page;
        }

        public async Task<MySpacePage> UpdateAsync(MySpacePage page)
        {
            _context.MySpacePages.Update(page);
            await _context.SaveChangesAsync();
            return page;
        }

        public async Task DeleteAsync(MySpacePage page)
        {
            _context.MySpacePages.Remove(page);
            await _context.SaveChangesAsync();
        }
    }
}
