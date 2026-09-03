using TaskFlow.API.Models;

namespace TaskFlow.API.Services;

// JWT oluşturma işlemlerini tanımlar.
public interface ITokenService
{
    // Giriş yapan kullanıcı için JWT üretir.
    string CreateToken(User user, bool rememberMe = false);
}