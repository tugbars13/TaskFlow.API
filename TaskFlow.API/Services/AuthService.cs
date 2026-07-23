using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using Microsoft.EntityFrameworkCore; // FirstOrDefaultAsync gibi EF Core metotları için
using BCrypt.Net;

namespace TaskFlow.API.Services;

// Kullanıcı kayıt ve giriş işlemlerini yöneten servis.
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;      // Veritabanına erişim.
    private readonly ITokenService _tokenService; // JWT üretmek için.

    // Dependency Injection ile gerekli servisleri alıyoruz.
    public AuthService(
        AppDbContext context,
        ITokenService tokenService)
    {
        _context = context;           // DbContext'i sakla.
        _tokenService = tokenService; // Token servisini sakla.
    }

    // Kullanıcı kayıt işlemi (bir sonraki adımda dolduracağız).
    public async Task<string?> RegisterAsync(RegisterDto dto)
    {
        // Aynı email ile kayıtlı kullanıcı var mı kontrol et.
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (existingUser != null)
        {
            // Email zaten kayıtlı.
            return null;
        }

        // Kullanıcının şifresini güvenli şekilde hash'liyoruz.
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Yeni User nesnesi oluşturuyoruz.
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = passwordHash,
            CreatedDate = DateTime.Now
        };

        // Kullanıcıyı veritabanına ekle.
        _context.Users.Add(user);

        // Değişiklikleri kaydet.
        await _context.SaveChangesAsync();

        // Kayıt başarılıysa JWT üret ve geri döndür.
        return _tokenService.CreateToken(user);
    }

    // Kullanıcı giriş işlemi (bir sonraki adımda dolduracağız).
    // Kullanıcı giriş işlemi
    public async Task<string?> LoginAsync(LoginDto dto)
    {
        // Email'e göre kullanıcıyı bul.
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email); // Email eşleşen kullanıcıyı getir.

        // Kullanıcı bulunamadıysa giriş başarısız.
        if (user == null)
            return null;

        // Girilen şifre ile veritabanındaki hash'i karşılaştır.
        bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash);

        // Şifre yanlışsa giriş başarısız.
        if (!isPasswordCorrect)
            return null;

        // Şifre doğruysa JWT oluştur.
        return _tokenService.CreateToken(user);
    }
}