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

        public async Task<IEnumerable<MySpaceFolder>> GetAllAsync()
        {
            return await _context.MySpaceFolders
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<MySpaceFolder?> GetByIdAsync(int id)
        {
            return await _context.MySpaceFolders.FindAsync(id);
        }

        public async Task<MySpaceFolder> CreateAsync(MySpaceFolder folder)
        {
            _context.MySpaceFolders.Add(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<MySpaceFolder> UpdateAsync(MySpaceFolder folder)
        {
            _context.MySpaceFolders.Update(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task DeleteAsync(MySpaceFolder folder)
        {
            _context.MySpaceFolders.Remove(folder);
            await _context.SaveChangesAsync();
        }
    }
}
