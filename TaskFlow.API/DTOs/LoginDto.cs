namespace TaskFlow.API.DTOs;

// Kullanıcı giriş yaparken gelecek bilgiler.
public class LoginDto
{
    public string Email { get; set; } = string.Empty; // Email

    public string Password { get; set; } = string.Empty; // Şifre
}