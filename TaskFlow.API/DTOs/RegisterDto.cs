namespace TaskFlow.API.DTOs;

// Kullanıcı kayıt olurken gelecek bilgiler.
public class RegisterDto
{
    public string FullName { get; set; } = string.Empty; // Ad Soyad

    public string Email { get; set; } = string.Empty; // Email

    public string Password { get; set; } = string.Empty; // Şifre
}