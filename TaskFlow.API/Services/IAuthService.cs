using TaskFlow.API.DTOs;

// Auth işlemlerinin sözleşmesini tanımlar.
namespace TaskFlow.API.Services;

public interface IAuthService
{
    // Kullanıcı kaydı oluşturur.
    Task<string?> RegisterAsync(RegisterDto dto);

    // Kullanıcı giriş yapar ve JWT döndürür.
    Task<string?> LoginAsync(LoginDto dto);
}