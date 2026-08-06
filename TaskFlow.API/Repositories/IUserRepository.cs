using TaskFlow.API.Models;

namespace TaskFlow.API.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<List<User>> GetAllAsync(); // BU SATIRI EKLE
    Task AddAsync(User user);
    Task SaveChangesAsync();
}